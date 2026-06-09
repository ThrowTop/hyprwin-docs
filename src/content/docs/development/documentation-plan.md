---
title: Documentation Plan
description: Initial plan for building out the HyprwinV2 documentation.
---

Initial documentation priorities:

1. Write a concise getting started guide.
2. Port the current Lua API notes into `lua/api-reference`.
3. Add practical Lua examples for common workflows.
4. Document the custom shader ABI before adding many shader examples.
5. Add screenshots or diagrams only when they clarify behavior.
6. Add release/version notes once HyprwinV2 has public releases.

Hosting plan:

- repository: `ThrowTop/hyprwin-docs`
- initial URL: `https://throwtop.dev/hyprwin-docs/`
- later custom domain option: `https://docs.throwtop.dev/`

If the site moves to a custom subdomain later, update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://docs.throwtop.dev',
  integrations: [
    starlight({
      title: 'HyprwinV2 Docs',
    }),
  ],
});
```
