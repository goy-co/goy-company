import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import sentry from '@sentry/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sentry({
      dsn: process.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: 'fe-identity',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
    svelte(),
    react()
  ],
  vite: {
    plugins: [tailwind()],
  },
});
