---
title: Lua Examples
description: Practical Lua examples for HyprwinV2.
---

This page will collect complete Lua snippets.

```lua
hyprwin.bind("SUPER", "F", function()
  local win = hyprwin.window.focused()
  if win then
    hyprwin.window.toggle_floating(win)
  end
end)
```

