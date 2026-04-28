import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
    baseURL: window.location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://api-worker.goycompany.workers.dev'
});
