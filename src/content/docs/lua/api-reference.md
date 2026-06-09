---
title: Lua API Reference
description: Reference for HyprwinV2 Lua APIs.
---

This page will become the main Lua API reference.

Example reference shape:

## `hyprwin.bind()`

Registers a keyboard binding.

```lua
hyprwin.bind("SUPER SHIFT", "Q", function()
  hyprwin.window.close_focused()
end)
```

## `hyprwin.window`

Window-related operations.

```lua
local win = hyprwin.window.focused()
if win then
  hyprwin.window.move(win, 100, 100)
end
```

