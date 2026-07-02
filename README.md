# HyprWin Docs

Documentation site for HyprWin configuration, Lua scripting, and custom shaders.

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

## Deployment

The site is configured for GitHub Pages at:

```text
https://throwtop.dev/hyprwin-docs/
```

Deployment runs through `.github/workflows/deploy.yml`.

If this later moves to a custom subdomain such as `https://docs.throwtop.dev/`, update `astro.config.mjs` by changing `site` and removing `base`.
