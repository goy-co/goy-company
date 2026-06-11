import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
	integrations: [
		starlight({
			title: 'The Goy Company // Docs',
			social: [
				{ label: 'GitHub', href: 'https://github.com/goy-co/goy-company', icon: 'github' },
			],
			sidebar: [
				{
					label: 'Foundation',
					autogenerate: { directory: 'foundation' },
				},
				{
					label: 'Architecture',
					autogenerate: { directory: 'architecture' },
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
		svelte(),
	],
	vite: {
		plugins: [tailwind()],
	},
});
