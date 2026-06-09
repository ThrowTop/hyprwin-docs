// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://throwtop.github.io',
	base: '/hyprwin-docs',
	integrations: [
		starlight({
			title: 'HyprwinV2 Docs',
			description: 'Documentation for HyprwinV2 Lua scripting and custom shaders.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ThrowTop/hyprwinv2' }],
			editLink: {
				baseUrl: 'https://github.com/ThrowTop/hyprwin-docs/edit/main/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Overview', slug: 'getting-started/overview' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Lua',
					items: [
						{ label: 'Overview', slug: 'lua/overview' },
						{ label: 'API Reference', slug: 'lua/api-reference' },
						{ label: 'Examples', slug: 'lua/examples' },
					],
				},
				{
					label: 'Shaders',
					items: [
						{ label: 'Custom Shader ABI', slug: 'shaders/custom-shader-abi' },
						{ label: 'Uniforms', slug: 'shaders/uniforms' },
						{ label: 'Examples', slug: 'shaders/examples' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Building', slug: 'development/building' },
						{ label: 'Documentation Plan', slug: 'development/documentation-plan' },
					],
				},
			],
		}),
	],
});
