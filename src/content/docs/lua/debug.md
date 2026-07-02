---
title: hw.debug
description: LuaJIT and shader compiler diagnostics.
---

| Member | Returns | Description |
| --- | --- | --- |
| `jit_off()` | nothing | Disable LuaJIT compilation for the current Lua state. |
| `shader_compiler_status()` | `table` | Report runtime shader compiler availability. |

`jit_off()` affects the current Lua state. Reloading creates a new state with
LuaJIT enabled.

`shader_compiler_status()` returns:

```text
{
  available = boolean,
  diagnostics = string,
}
```

The check locates and loads `d3dcompiler_47.dll`. `diagnostics` explains the
result.
