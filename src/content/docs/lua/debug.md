---
title: hw.debug
description: LuaJIT and shader compiler diagnostics.
---

## LuaJIT control

```lua
hw.debug.jit(false)
hw.debug.jit(true)
```

`hw.debug.jit(enabled)` enables or disables compilation for the current Lua
state and returns nothing. The argument must be a boolean.

JIT is enabled when a Lua state is created. Reloading the configuration creates
a new state with JIT enabled.

Disabling JIT makes the instruction-hook timeout more reliable for guarded Lua
callbacks, because compiled loops may not check the hook promptly. The tradeoff
is lower Lua execution performance. Enable it again with
`hw.debug.jit(true)`.

## Shader compiler diagnostics

`hw.debug.shader_compiler_status()` returns:

```text
{
  available = boolean,
  diagnostics = string,
}
```

The check locates and loads `d3dcompiler_47.dll`. `diagnostics` explains the
result.
