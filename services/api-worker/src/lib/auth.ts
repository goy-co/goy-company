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
    emailAndPassword: {
      enabled: true,
    },
    // Goy Grid: Mapping Better Auth users to Nostr Pubkeys
    user: {
      additionalFields: {
        pubkey: {
          type: "string",
          required: false,
        }
      }
    }
  });
};
