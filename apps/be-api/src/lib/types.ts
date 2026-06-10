import { NostrAgent } from "../agents/NostrAgent";

export interface Env {
  IDENTITY_CACHE: KVNamespace;
  DB: D1Database;
  ASSETS: R2Bucket;
  NOSTR_AGENT: DurableObjectNamespace<NostrAgent>;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
  SENTRY_DSN?: string;
}
