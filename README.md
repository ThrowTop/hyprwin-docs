# HyprwinV2 Docs

Documentation site for HyprwinV2 Lua scripting, custom shaders, and development notes.

Built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## Local Development

Install dependencies:

```powershell
npm install
```

Start the dev server:

```powershell
npm run dev
```

Build the static site:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## Content

Docs live in:

```text
src/content/docs/
```

Current sections:

- `getting-started/`
- `lua/`
- `shaders/`
- `development/`

## Deployment

The site is configured for GitHub Pages at:

```text
https://throwtop.github.io/hyprwin-docs/
```

Deployment runs through `.github/workflows/deploy.yml`.

If this later moves to a custom subdomain such as `https://docs.throwtop.dev/`, update `astro.config.mjs` by changing `site` and removing `base`.
