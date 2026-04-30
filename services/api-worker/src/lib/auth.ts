import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

export const getAuth = (db: D1Database, env: any) => {
  return betterAuth({
    database: drizzleAdapter(drizzle(db), {
      provider: "sqlite",
      schema: schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.ENVIRONMENT === 'development' ? 'http://localhost:8787' : 'https://api-worker.goycompany.workers.dev',
    trustedOrigins: [
      "http://localhost:4321",
      "http://localhost:4322",
      "https://goy-identity.pages.dev"
    ],
    emailAndPassword: {
      enabled: true,
    },
    // Goy Grid: Mapping Better Auth users to Nostr Identity & Metadata
    user: {
      additionalFields: {
        pubkey: { type: "string", required: false },
        nsec: { type: "string", required: false },
        bio: { type: "string", required: false },
        displayName: { type: "string", required: false },
        banner: { type: "string", required: false },
        website: { type: "string", required: false },
        nip05: { type: "string", required: false },
        lud16: { type: "string", required: false }
      }
    }
  });
};
