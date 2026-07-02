---
title: Shader Tools and Resources
description: Authoritative HLSL references and practical tools for developing HyprWin shaders.
---

HyprWin compiles Direct3D 11 pixel shaders with the legacy `D3DCompile` compiler
and target profile `ps_5_0`. Prefer Shader Model 5 documentation when a resource
describes features from several Direct3D generations.

## Microsoft HLSL documentation

- [HLSL programming guide](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-pguide)
  introduces the language and Direct3D shader stages.
- [HLSL reference](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-reference)
  is the main index for syntax, types, compiler behavior, and language features.
- [Intrinsic functions](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-intrinsic-functions)
  lists functions such as `saturate`, `smoothstep`, `lerp`, `frac`, `fwidth`,
  `sin`, `length`, and `dot`.
- [Semantics](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics)
  explains `SV_Position` and `SV_Target`.
- [Shader constants](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-constants)
  explains constant buffers and register binding.
- [Shader Model 5 reference](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/d3d11-graphics-reference-sm5)
  defines the capabilities available to HyprWin shaders.

HyprWin's supplied API header remains authoritative for its constant-buffer
layout and entry-point contract. General HLSL examples cannot know which
resources HyprWin binds.

## Editors and diagnostics

Any text editor can edit `.hlsl` files. An editor with HLSL syntax support is
useful, but its standalone validator may target a different compiler or shader
model than HyprWin.

[SHADERed](https://shadered.org/) is a free shader editor with HLSL support,
debugging, and profiling. It can help explore algorithms, but its preview
pipeline does not automatically provide HyprWin's constant buffer or helper
functions. Port the relevant technique rather than expecting a HyprWin shader
to run unchanged.

The definitive compatibility check is HyprWin's own compiler:

```lua
local compiler = hw.debug.shader_compiler_status()
hw.log("info", compiler.diagnostics)
```

Compilation failures and successful shader installation are recorded in the
[HyprWin log](/hyprwin-docs/logging/).

## Search terms

These terms lead to techniques that transfer well to the HyprWin overlay:

- signed-distance field or SDF rounded rectangle;
- anti-aliased SDF with `fwidth`;
- HLSL value noise and fractal Brownian motion;
- procedural plasma shader;
- premultiplied alpha blending;
- screen-space pixel shader effects.

When adapting code written in GLSL, translate types and intrinsics carefully:
`vec2` becomes `float2`, `mix` becomes `lerp`, and `fract` becomes `frac`.
Texture-based examples require larger changes because HyprWin does not bind
custom textures or samplers.
