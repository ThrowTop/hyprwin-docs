---
title: Example Shader Effects
description: Apply HyprWin shader techniques to borders, holograms, fire, plasma, and radar effects.
---

Place your shader beside the shipped `shaders/hyprwin_shader_api.hlsl` file and
select it:

```lua
hw.settings.shader = "shaders/custom.hlsl"
```

The following effect outlines show how the techniques fit together. They are
starting points rather than files shipped with HyprWin.

## Basic border

A basic border is the clearest first implementation. It combines:

- a rounded-box signed-distance function;
- separate inner and outer border masks;
- a directional palette gradient;
- exponential outer glow;
- premultiplied alpha output.

Start here when creating a conventional animated border.

## Hologram

A hologram effect can combine four moving plane waves. Slightly offset samples
drive the red and blue channels, producing chromatic separation. An angle
around the window can place moving specular flashes.

Study it for:

- interference patterns built from `sin(dot(position, direction))`;
- angular coordinates with `atan2`;
- palette-driven chromatic effects;
- combining border masks, caustics, highlights, and glow.

## Fire

A fire effect can build four octaves of value noise and scroll the sampling
coordinates over time. The distance from the rounded rectangle limits the
result to a flame-shaped region around the window.

Study it for:

- hash-based value noise;
- manually unrolled fractal Brownian motion;
- coordinate warping;
- mapping procedural intensity through the configured palette.

Noise-heavy shaders are among the most expensive examples. Reduce the octave
count before increasing spatial detail.

## Plasma

A plasma effect combines planar sine waves and radial waves centered on moving
points. Sampling the palette twice allows the blend between those samples to
vary over space and time.

Study it for:

- inexpensive procedural animation;
- orbiting points;
- radial waves using `length`;
- filling the window interior while retaining a stronger border and glow.

## Radar

A radar effect converts each pixel to an angle with `atan2`, compares that
angle with a rotating sweep, and raises the remaining trail value to a power
for phosphor-like decay.

Study it for:

- cyclic angular differences with `frac`;
- sweep trails and nonlinear decay;
- concentric rings;
- crosshair masks;
- combining interior guides with a window border.

## Adapt an example

Change one category at a time:

1. Select a palette in `hw.settings.colors`.
2. Adjust `border`, `corner_radius`, `outer_alpha`, and `glow_falloff`.
3. Change animation frequencies or speeds.
4. Modify masks and spatial frequencies.
5. Only then add another procedural layer.

Reload the configuration after editing the shader. If compilation fails, open
the HyprWin log and fix the first compiler diagnostic before investigating
later messages.
