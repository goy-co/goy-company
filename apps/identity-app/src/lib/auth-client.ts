import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:8787' 
        : 'https://api-worker.goycompany.workers.dev'
});
