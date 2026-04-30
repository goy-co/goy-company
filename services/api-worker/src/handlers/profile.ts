import { verifyEvent, finalizeEvent } from "nostr-tools";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { DEFAULT_RELAYS } from "../lib/constants";
import { Env } from "../lib/types";
import { ensureNostrKeys } from "../lib/keys";
import { aggregateIdentity } from "../lib/identity";
import { getCorsHeaders } from "../index";

export async function handleProfile(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  session: any,
): Promise<Response> {
  const url = new URL(request.url);
  const identifier = url.pathname.split("/")[2];
  const db = drizzle(env.DB, { schema });
  const corsHeaders = getCorsHeaders(request);

  try {
    if (request.method === "POST") {
      const body = (await request.json()) as any;

      // A: Sovereign Path (Signed Event)
      if (body.sig && body.pubkey) {
        if (!verifyEvent(body))
          return new Response("INVALID_SIG", {
            status: 400,
            headers: corsHeaders,
          });

        // Only update cache and broadcast if it's a Metadata Event (Kind 0)
        if (body.kind === 0) {
          const metadata = JSON.parse(body.content);
          const pk = body.pubkey.toLowerCase();
          metadata.pubkey = pk;

          // 1. Anchor in D1 for Grid persistence (acting as a "Grid Record")
          try {
            await db
              .insert(schema.user)
              .values({
                id: pk,
                pubkey: pk,
                name: metadata.name || "",
                displayName: metadata.display_name || metadata.name || "",
                bio: metadata.about || "",
                image: metadata.picture || "",
                banner: metadata.banner || "",
                website: metadata.website || "",
                nip05: metadata.nip05 || "",
                lud16: metadata.lud16 || "",
                email: `${pk}@goy.grid`, // System email
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: schema.user.pubkey,
                set: {
                  name: metadata.name || "",
                  displayName: metadata.display_name || metadata.name || "",
                  bio: metadata.about || "",
                  image: metadata.picture || "",
                  banner: metadata.banner || "",
                  website: metadata.website || "",
                  nip05: metadata.nip05 || "",
                  lud16: metadata.lud16 || "",
                  updatedAt: new Date(),
                },
              });
          } catch (e) {
            console.error("D1_ANCHOR_ERROR:", e);
          }

          // 2. Immediate KV update
          await env.IDENTITY_CACHE.put(
            `identity_agg:${pk}`,
            JSON.stringify({ metadata, fetched_at: Date.now() }),
            { expirationTtl: 3600 },
          );

          // 3. Grid Agent Uplink
          ctx.waitUntil(
            env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pk)).fetch(
              new Request(`http://uplink/uplink/${pk}`, {
                method: "POST",
                body: JSON.stringify({
                  type: "metadata",
                  content: metadata,
                  rawEvent: body,
                }),
              }),
            ),
          );

          // 4. Decentralized Broadcast
          ctx.waitUntil(broadcastToGrid(body));
        }

        return new Response(
          JSON.stringify({ success: true, kind: body.kind }),
          { headers: corsHeaders },
        );
      }

      // B: Traditional Path (Raw JSON + Session)
      if (!session?.user)
        return new Response("UNAUTHORIZED", {
          status: 401,
          headers: corsHeaders,
        });
      const keys = await ensureNostrKeys(session.user.id, env);

      // Clean metadata payload for Nostr (remove any internal fields)
      const cleanMetadata = {
        name: body.name,
        display_name: body.display_name,
        about: body.about,
        picture: body.picture,
        banner: body.banner,
        website: body.website,
        nip05: body.nip05,
        lud16: body.lud16,
        pubkey: keys.pubkey, // Include the pubkey
      };

      // Update D1 immediately to keep central records in sync
      await db
        .update(schema.user)
        .set({
          name: cleanMetadata.name || session.user.name,
          displayName: cleanMetadata.display_name || cleanMetadata.name,
          bio: cleanMetadata.about,
          image: cleanMetadata.picture,
          banner: cleanMetadata.banner,
          website: cleanMetadata.website,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, session.user.id));

      const skHex = keys.nsec.trim();
      const skBytes = new Uint8Array(
        skHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      );

      const eventTemplate = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(cleanMetadata),
      };
      const signedEvent = finalizeEvent(eventTemplate, skBytes);

      // Immediate broadcast to the Grid Agent (Durable Object) for real-time UI
      ctx.waitUntil(
        env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(keys.pubkey)).fetch(
          new Request(`http://uplink/uplink/${keys.pubkey}`, {
            method: "POST",
            body: JSON.stringify({
              type: "metadata",
              content: cleanMetadata,
              rawEvent: signedEvent,
            }),
          }),
        ),
      );

      // Robust Multicast to relays
      ctx.waitUntil(broadcastToGrid(signedEvent));

      // Immediate KV update for speed
      await env.IDENTITY_CACHE.put(
        `identity_agg:${keys.pubkey}`,
        JSON.stringify({ metadata: cleanMetadata, fetched_at: Date.now() }),
        { expirationTtl: 3600 },
      );

      return new Response(
        JSON.stringify({ success: true, pubkey: keys.pubkey }),
        { headers: corsHeaders },
      );
    }

    const identity = await aggregateIdentity(identifier, env, ctx);
    return new Response(JSON.stringify(identity), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e: any) {
    console.error("PROFILE_ERROR:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
