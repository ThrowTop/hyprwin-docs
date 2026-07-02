---
title: Custom Shaders
description: Understand the HyprWin shader pipeline and write a first HLSL pixel shader.
---

HyprWin custom shaders control the pixels in the move and resize preview
overlay. HyprWin supplies the target rectangle, settings.colors, settings, and timing;
your HLSL function returns the color and opacity of each canvas pixel.

Only the pixel shader is customizable. HyprWin owns the Direct3D 11 device,
vertex shader, geometry, blend state, constant buffer, and presentation.

Set `hw.settings.shader` to an HLSL file to replace the built-in overlay pixel
shader:

```lua title="hyprwin.lua"
hw.settings.shader = "shaders/custom.hlsl"
```

The path is resolved relative to `hyprwin.lua`. Set it to `nil` or an empty
string to restore the built-in shader.

## Requirements

Custom shaders require `d3dcompiler_47.dll` either beside `hyprwin.exe` or
available from Windows System32.

Check availability from Lua:

```lua title="hyprwin.lua"
local status = hw.debug.shader_compiler_status()
hw.log("info", status.diagnostics)
```

HyprWin ships `shaders/hyprwin_shader_api.hlsl` beside the executable. Place
custom shaders in that directory so the include resolves both in HyprWin and
in your HLSL language server.

If HLSL is new to you, read [Techniques](/hyprwin-docs/shaders/techniques/)
after completing the minimal shader. The [Tools and
Resources](/hyprwin-docs/shaders/resources/) page links to the relevant
Microsoft language and Shader Model 5 references.

## Minimal shader

```hlsl title="custom.hlsl"
#include "hyprwin_shader_api.hlsl"

float rounded_box_distance(float2 p, float2 halfSize, float radius) {
    float2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0f))
         + min(max(q.x, q.y), 0.0f)
         - radius;
}

float4 hyprwin_pixel(HyprWinPixelInput input) {
    float2 p = input.screenPosition - runtime.rectCenter;
    float d = rounded_box_distance(p, runtime.rectHalfSize, settings.cornerRadius);
    float borderDistance = d + 1.0f;
    float width = max(settings.borderThickness, 1.0f);
    float aa = max(fwidth(borderDistance), 0.5f);
    float border = smoothstep(-aa, 0.0f, borderDistance) *
                   smoothstep(width + aa, width - aa, borderDistance);

    float t = dot(p, settings.gradientDirection) /
              (runtime.gradientScale * 2.0f) + 0.5f;
    float4 color = hyprwin_sample_palette(t);
    float alpha = saturate(border * color.a);
    return float4(color.rgb * alpha, alpha);
}
```

The API header provides the `ps_main` entry point. A custom file must implement:

```hlsl title="hyprwin_shader_api.hlsl"
float4 hyprwin_pixel(HyprWinPixelInput input);
```

HyprWin compiles `ps_main` for shader model `ps_5_0`. Strict compilation and
warnings-as-errors are enabled.

The minimal example follows the built-in shader's positioning convention. The
visible border overlaps the target rectangle by one physical pixel to prevent a
sampling seam, then extends outward by the configured width. The rounded-box
distance keeps the outline aligned with the DPI-scaled corner radius.

This convention is recommended, not required. A custom pixel shader receives
the full virtual-desktop canvas and may draw inside the target rectangle or
anywhere else on that canvas.

## Output alpha

Return premultiplied RGBA:

```hlsl
return float4(rgb * alpha, alpha);
```

The overlay uses premultiplied alpha composition. Returning unmodified RGB with
partial alpha produces incorrect blending.

## Input

`HyprWinPixelInput.screenPosition` contains canvas-local pixel coordinates from
`SV_Position`. Pixel centers are offset by one half pixel, as defined by the
Direct3D system-value semantic.

Useful coordinate forms are:

```hlsl
float2 canvasUv = input.screenPosition / max(runtime.canvasSize, 1.0f);
float2 windowPx = input.screenPosition - runtime.rectCenter;
float2 windowUv = windowPx / max(runtime.rectHalfSize, 1.0f);
```

- `canvasUv` normally spans `0.0` through `1.0` across the virtual-desktop
  overlay.
- `windowPx` is measured in pixels from the target rectangle center.
- `windowUv` is approximately `-1.0` through `1.0` across the target rectangle.

Do not assume `runtime.rectCenter` equals `runtime.canvasSize / 2`; the target can be anywhere
on a multi-monitor virtual desktop.

## Recommended border positioning

`rounded_box_distance` returns zero at the target window's DWM visual bounds,
negative values inside, and positive values outside. Use this adjusted distance
for a conventional outline:

```hlsl
float borderDistance = d + 1.0f;
```

The one-pixel offset places the first border layer just inside the visual
boundary. This avoids a transparent seam caused by pixel-center sampling while
leaving the remaining border thickness outside the window. Start exterior glow
after `borderDistance == settings.borderThickness`.

## Runtime values

The `HyprWinParams` constant buffer is bound at `b0`.

| Field | Type | Description |
| --- | --- | --- |
| `runtime.canvasSize` | `float2` | Overlay canvas width and height. |
| `runtime.rectCenter` | `float2` | Target rectangle center in canvas coordinates. |
| `runtime.rectHalfSize` | `float2` | Half width and half height of the target rectangle. |
| `runtime.gradientScale` | `float` | At least 1, based on target rectangle half-size length. |
| `runtime.sessionType` | `uint` | `0` none, `1` drag, `2` resize. |
| `runtime.timeSeconds` | `float` | Shader animation time. |
| `runtime.deltaSeconds` | `float` | Time since the previous rendered frame. |
| `runtime.sessionSeconds` | `float` | Time since the current drag or resize session began. |

## User settings

These values come from the active Lua settings:

| Field | Type | Description |
| --- | --- | --- |
| `settings.gradientDirection` | `float2` | Direction derived from the current gradient angle. |
| `settings.borderThickness` | `float` | `hw.settings.border`. |
| `settings.cornerRadius` | `float` | `hw.settings.corner_radius` scaled by the grabbed window's DPI. |
| `settings.outerAlpha` | `float` | Outer border-edge opacity and exterior glow strength from `hw.settings.outer_alpha`. |
| `settings.glowFalloff` | `float` | `hw.settings.glow_falloff`. |
| `settings.colorCount` | `uint` | Active palette count from 1 through 16. |
| `settings.colors` | `float4[16]` | Normalized RGBA palette values. |

The complete constant buffer is 336 bytes. Include the supplied API header
instead of copying its layout so the HLSL and native layout remain aligned.
The [Shader API Reference](/hyprwin-docs/shaders/api/) shows the exact structs
and complete header shipped with the current release.

`runtime.timeSeconds` is continuous while the overlay renderer exists and wraps after
one hour. `runtime.sessionSeconds` resets when the operation changes between no
operation, dragging, and resizing. `runtime.deltaSeconds` is zero on the first rendered
frame after timing is reset.

## Palette helpers

| Function | Description |
| --- | --- |
| `hyprwin_palette_count()` | Clamped active color count. |
| `hyprwin_palette_color(index)` | Palette color with index clamped to the last color. |
| `hyprwin_sample_palette(t)` | Interpolate across the palette with saturated `t`. |

The palette colors include their configured alpha. Most shaders use the sampled
RGB and calculate final coverage separately:

```hlsl
float4 palette = hyprwin_sample_palette(t);
float alpha = saturate(mask * palette.a);
return float4(palette.rgb * alpha, alpha);
```

## Compilation and cache

Debug builds compile with debug information and optimization disabled. Release
builds use optimization level 3.

Successful bytecode is cached under `shader-cache/` beside the executable.
Cache identity includes the main shader path, its modification time, build
debug mode, shader profile, and ABI version.

:::caution
The cache tracks the main shader file modification time, not modification times
of files included by it. After changing only an included file, also touch the
main shader file or delete its files from `shader-cache/`.
:::

Reload the HyprWin configuration after changing shader source. Compilation
errors are written to the log, and a failed compilation does not install new
bytecode.

## Continue learning

- [Techniques](/hyprwin-docs/shaders/techniques/) explains distance fields,
  anti-aliasing, glow, animation, and performance.
- [Shader API Reference](/hyprwin-docs/shaders/api/) contains the complete
  `hyprwin_shader_api.hlsl` contract.
- [Example Effects](/hyprwin-docs/shaders/examples/) maps common visual effects
  to the techniques used to build them.
- [Tools and Resources](/hyprwin-docs/shaders/resources/) collects authoritative
  HLSL references and practical development tools.
