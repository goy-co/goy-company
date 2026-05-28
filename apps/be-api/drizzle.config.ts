import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// Automatically find the local D1 SQLite file for Studio
let localSqlite: string | undefined;
const d1Dir = './.wrangler/state/v3/d1/miniflare-D1DatabaseObject';

if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  const sqliteFile = files.find(f => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
  if (sqliteFile) {
    localSqlite = path.join(d1Dir, sqliteFile);
  }
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: localSqlite ? {
    url: localSqlite,
  } : {
    // Fallback for CI or remote
    url: 'file:./local.sqlite' 
  },
});
