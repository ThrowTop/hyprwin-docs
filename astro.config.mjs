// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://throwtop.dev',
	base: '/hyprwin-docs',
	integrations: [
		starlight({
			title: 'HyprWin Docs',
			description: 'Documentation for HyprWin configuration, Lua scripting, and custom shaders.',
			favicon: '/favicon.ico',
			logo: {
				src: './src/assets/hyprwin.svg',
				alt: 'HyprWin',
			},
			lastUpdated: true,
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ThrowTop/hyprwin' }],
			editLink: {
				baseUrl: 'https://github.com/ThrowTop/hyprwin-docs/edit/main/',
			},
			components: {
				Footer: './src/components/Footer.astro',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{
							label: 'Download',
							slug: 'getting-started/download',
							badge: { text: 'Releases', variant: 'success' },
						},
						{ label: 'Install and First Run', slug: 'getting-started' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Lua',
					items: [
						{ label: 'Globals and Standard Library', slug: 'lua/globals' },
						{ label: 'hw', slug: 'lua/hw' },
						{ label: 'hw.bind', slug: 'lua/bind' },
						{ label: 'hw.settings', slug: 'lua/settings' },
						{ label: 'hw.window', slug: 'lua/window' },
						{ label: 'hw.mon', slug: 'lua/monitors' },
						{ label: 'hw.input', slug: 'lua/input' },
						{ label: 'hw.mouse', slug: 'lua/mouse' },
						{ label: 'hw.fs', slug: 'lua/fs' },
						{ label: 'hw.clipboard', slug: 'lua/clipboard' },
						{ label: 'hw.audio', slug: 'lua/audio' },
						{ label: 'hw.sys', slug: 'lua/sys' },
						{ label: 'hw.debug', slug: 'lua/debug' },
					],
				},
				{
					label: 'Diagnostics',
					items: [
						{ label: 'Logging', slug: 'logging' },
						{ label: 'Troubleshooting', slug: 'getting-started/troubleshooting' },
					],
				},
				{
					label: 'Shaders',
					items: [
						{ label: 'Overview and API', slug: 'shaders/custom' },
						{ label: 'Shader API Reference', slug: 'shaders/api' },
						{ label: 'Techniques', slug: 'shaders/techniques' },
						{ label: 'Example Effects', slug: 'shaders/examples' },
						{ label: 'Tools and Resources', slug: 'shaders/resources' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Recipes', slug: 'guides/recipes' },
					],
				},
			],
		}),
	],
});
