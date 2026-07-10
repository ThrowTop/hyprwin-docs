---
title: Shader Techniques
description: Build borders, glow, gradients, animation, and procedural effects for HyprWin.
---

This guide focuses on techniques that fit HyprWin's pixel-shader-only overlay.
All examples assume `hyprwin_shader_api.hlsl` is included.

## Useful links

HyprWin compiles Direct3D 11 pixel shaders as `ps_5_0`.

- [HLSL programming guide](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-pguide)
- [HLSL reference](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-reference)
- [Intrinsic functions](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-intrinsic-functions)
- [Shader semantics](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics)
- [Shader Model 5 reference](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/d3d11-graphics-reference-sm5)
- [SHADERed](https://shadered.org/), a shader editor with HLSL debugging and
  profiling

HyprWin's own compiler is the final compatibility check. Compilation results
are recorded in the [HyprWin log](/hyprwin-docs/logging/).

## Rounded rectangle distance

A signed-distance function returns a negative value inside a shape, zero on its
surface, and a positive value outside. This rounded-box function describes the
target window:

```hlsl
float sd_rounded_box(float2 p, float2 halfSize, float radius) {
    float2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0f))
         + min(max(q.x, q.y), 0.0f)
         - radius;
}

float2 p = input.screenPosition - runtime.rectCenter;
float d = sd_rounded_box(p, runtime.rectHalfSize, settings.cornerRadius);
```

The result remains useful when the window changes size because it is expressed
relative to `runtime.rectCenter` and `runtime.rectHalfSize`.

## Border masks

For the recommended HyprWin positioning, shift the distance one physical pixel
inward and extend the remaining border outward:

```hlsl
float width = max(settings.borderThickness, 1.0f);
float borderDistance = d + 1.0f;
float aa = max(fwidth(borderDistance), 0.5f);
float borderMask = smoothstep(-aa, 0.0f, borderDistance) *
                   smoothstep(width + aa, width - aa, borderDistance);
```

`fwidth` is available in pixel shaders and measures how quickly a value changes
across neighboring pixels. The inward overlap prevents a sampling seam; the
remaining band extends outward. Custom effects may ignore this convention and
draw anywhere on `runtime.canvasSize`.

The built-in border opacity varies continuously through its thickness:

```hlsl
float opaqueWidth = min(width, 1.0f);
float fadeWidth = max(width - opaqueWidth, 1.0f);
float fade = saturate((borderDistance - opaqueWidth) / fadeWidth);
float borderAlpha = lerp(1.0f, settings.outerAlpha, fade);
```

The first physical pixel remains fully opaque when the palette color is opaque.
The rest of the border fades continuously to `settings.outerAlpha` at its outer
edge without splitting the thickness into separate bands. Only its
derivative-sized antialiasing fringe crosses the mathematical window edge,
preventing a visible subpixel seam.

## Outer glow

The positive part of the distance is the number of pixels outside the window.
An exponential falloff produces a controllable glow:

```hlsl
float glowDistance = max(borderDistance - width, 0.0f);
float glow = exp(-glowDistance * max(settings.glowFalloff, 0.001f));
glow *= smoothstep(width - aa, width + aa, borderDistance);
glow *= settings.outerAlpha;
```

The mask creates a narrow antialiased handoff at the border's outer edge so
there is no gap between border and glow. Clamp divisors and exponential rates
away from zero. A zero falloff would keep the glow visible across the entire
overlay canvas.

## Palette gradients

Project the window-relative position onto the direction supplied by
`hw.settings.gradient_angle`:

```hlsl
float t = dot(p, settings.gradientDirection) / (runtime.gradientScale * 2.0f) + 0.5f;
float4 color = hyprwin_sample_palette(t);
```

`hyprwin_sample_palette` saturates `t`, so values below zero select the first
color and values above one select the last. Use `frac(t)` before sampling for a
repeating palette.

## Animation

`runtime.timeSeconds` is appropriate for continuous animation:

```hlsl
float pulse = 0.75f + 0.25f * sin(runtime.timeSeconds * 4.0f);
```

Use `runtime.sessionSeconds` when an effect should restart for each drag or resize:

```hlsl
float intro = smoothstep(0.0f, 0.2f, runtime.sessionSeconds);
```

Use `runtime.deltaSeconds` only when integrating state mathematically. Pixel shaders
cannot retain values between frames, so most procedural animation should be a
direct function of time and position.

`runtime.sessionType` allows operation-specific appearance:

```hlsl
float resizeBoost = runtime.sessionType == 2u ? 1.25f : 1.0f;
```

## Procedural noise

HyprWin does not bind textures or samplers to custom shaders. Noise must
therefore be procedural. A small value-noise function is sufficient for many
effects:

```hlsl
float hash21(float2 p) {
    p = frac(p * float2(123.34f, 456.21f));
    p += dot(p, p + 45.32f);
    return frac(p.x * p.y);
}
```

Layering several frequencies creates fractal Brownian motion suitable for fire
and smoke effects. Each layer adds GPU work, so prefer a small fixed octave
count.

## Premultiplied output

HyprWin uses premultiplied alpha blending. Multiply RGB by final alpha exactly
once:

```hlsl
float alpha = saturate(borderMask + glow);
return float4(saturate(color.rgb) * alpha, alpha);
```

Common mistakes:

- Returning `float4(color.rgb, alpha)` creates bright fringes.
- Multiplying an already-premultiplied color again makes translucent pixels too
  dark.
- Returning RGB values outside the expected range can create clipping rather
  than additional glow.

## Performance

The shader runs for every pixel covered by the overlay canvas during active
move and resize sessions. Multi-monitor desktops can make that canvas large.

- Reuse calculated distances and normalized coordinates.
- Keep procedural-noise octave counts small and fixed.
- Prefer arithmetic and intrinsics over deeply divergent branches.
- Avoid loops whose iteration count depends on per-pixel data.
- Use `min`, `max`, and `saturate` to keep `sqrt`, division, logarithms, and
  powers in valid ranges.
- Test on the largest multi-monitor layout you support, not only a small window.
