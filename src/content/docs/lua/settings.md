---
title: hw.settings
description: Configure HyprWin behavior through the live hw.settings proxy.
---

`hw.settings` is a live proxy backed by HyprWin's native settings. It is not an
ordinary Lua table.

Assign a complete configuration table:

```lua
hw.settings = {
  super = "LWIN",
  border = 3,
  colors = {
    color.hex("00a2ff"),
    color.hex("ff00f7"),
  },
  gradient_angle = 45,
  rotating = true,
  rotation_speed = 120,
  corner_radius = 8,
  outer_alpha = 0.5,
  glow_falloff = 0.15,
  move_preview = "overlay",
  resize_preview = "overlay",
  live_preview_rate = 60,
  resize_corner = "closest",
  debug = {
    "trace_grabs",
    "interaction",
  },
}
```

Or read and write individual fields:

```lua
hw.settings.rotating = false
hw.log("info", "border: " .. hw.settings.border)
```

Assigning a table applies only the fields present in that table. It does not
replace the proxy or reset omitted settings. A new configuration load starts
from native defaults before applying the file.

Writes made while the configuration is loading are published together after a
successful load. Top-level setting writes made later from a binding or timer
are published immediately.

## Fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `super` | `"LWIN"` or `"RWIN"` | `"LWIN"` | Physical SUPER key. |
| `border` | `number` | `3` | Border width supplied to the overlay shader. |
| `colors` | `HW.Color[]` | blue and magenta | Shader palette with 1 through 16 colors. |
| `shader` | `string?` | `nil` | Custom HLSL shader path. |
| `gradient_angle` | `number` | `45` | Initial gradient angle in degrees. |
| `rotating` | `boolean` | `true` | Enables gradient rotation. |
| `rotation_speed` | `number` | `120` | Gradient rotation speed in degrees per second. |
| `corner_radius` | `number` | `8` | Logical rounded corner radius, scaled by the grabbed window's DPI for the shader. |
| `outer_alpha` | `number` | `0.5` | Built-in shader outer border-edge opacity and exterior glow strength. |
| `glow_falloff` | `number` | `0.15` | Glow falloff supplied to the shader. |
| `move_preview` | `"overlay"`, `"live"`, or `"thumbnail"` | `"overlay"` | Preview mode for SUPER plus left-button moving. |
| `resize_preview` | `"overlay"`, `"live"`, or `"thumbnail"` | `"overlay"` | Preview mode for SUPER plus right-button resizing. |
| `live_preview_rate` | `integer` | `60` | Maximum live placement submissions per second; `0` submits once per rendered frame. |
| `resize_corner` | `string` | `"closest"` | Corner used for SUPER plus right-button resizing. |
| `grab_filters` | `table[]` | empty | Ordered mouse target include and exclude rules. |
| `debug` | `string[]` | empty | Enabled runtime diagnostic categories. |

Numeric settings must be finite numbers. The native settings boundary does not
otherwise clamp these values.

An invalid field assignment is rejected and written to the log. Invalid
individual assignments do not themselves raise a Lua error.

## Colors

`colors` must be a list of 1 through 16 `HW.Color` values with no gaps.
Non-numeric keys and values of another type are rejected.

See [Globals and Standard Library](/hyprwin-docs/lua/globals/) for color constructors.

## Custom shader

Set `shader` to a path or `nil`:

```lua
hw.settings.shader = "shaders/custom.hlsl"
hw.settings.shader = nil
```

A relative path is resolved against the directory containing the active
`hyprwin.lua`, then normalized to an absolute path. `nil` or an empty string
selects the built-in shader.

## Resize corner

Accepted values are:

```text
closest
topleft
topright
bottomleft
bottomright
```

`closest` chooses a corner from the pointer position when resizing begins.

An invalid `super` string logs a warning and selects `LWIN`. A non-string value
is rejected without changing the current value.

## Move and resize previews

`move_preview` and `resize_preview` independently select how HyprWin previews
mouse interactions:

- `"overlay"` moves only the border overlay, then queues one real-window
  placement when the active mouse button or SUPER is released. This is the
  default and does not create a placement worker.
- `"live"` continuously moves the real window through a serialized,
  latest-position-wins worker. `live_preview_rate` limits placement
  submissions.
- `"thumbnail"` begins as a responsive border-only overlay while Windows
  Graphics Capture obtains one frozen frame. Once the thumbnail has been
  presented, HyprWin parks the real window outside the virtual desktop until
  the interaction commits.

The selected modes and live rate are captured when an interaction starts.
Changing them affects the next interaction. Releasing either SUPER or the
active mouse button commits through the same path.

For live mode, `live_preview_rate = 0` submits changed bounds once per rendered
overlay frame. Positive fractional values are truncated, negative values clamp
to zero, and values above `UINT32_MAX` clamp to `UINT32_MAX`.

Thumbnail capture requests borderless-capture permission once per process.
Permission waiting does not block border rendering. After capture starts, the
first frame has a 100 ms deadline. Unsupported, denied, failed, or timed-out
capture remains border-only and never parks the real window. During resize,
the frozen image is linearly scaled and does not reflect application layout
changes.

## Grab filters

Grab filters control which windows can be selected by SUPER plus mouse drag.
Each rule requires `action` and at least one of `process` or `class`:

```lua
hw.settings.grab_filters = {
  {
    action = "exclude",
    process = "notepad.exe",
  },
  {
    action = "include",
    process = "StartMenuExperienceHost.exe",
    class = "Windows.UI.Core.CoreWindow",
  },
}
```

Matching is case-insensitive and exact. When both `process` and `class` are
present, both must match. Rules are evaluated in order and the last matching
rule wins.

HyprWin has built-in exclusions for the taskbar, secondary taskbar, desktop
windows, and Start menu. User rules run afterward, so a later include rule can
override a built-in exclusion.

The rule table accepts only `action`, `process`, and `class`. The list cannot
have gaps or contain other keys.

## Debug settings

Choose the diagnostic categories to enable:

```lua
hw.settings = {
  debug = {
    "trace_grabs",
    "interaction",
    "snapshot",
  },
}
```

| Category | Details |
| --- | --- |
| `trace_binds` | Binding dispatch. |
| `bench_binds` | Binding execution time in microseconds. |
| `trace_grabs` | Mouse target selection. |
| `trace_super` | SUPER key dispatch. |
| `trace_timeout` | Guarded Lua callbacks approaching their timeout. |
| `overlay` | Overlay renderer recovery. |
| `window_placement` | Placement worker, window parking, and commits. |
| `interaction` | Drag and resize lifecycle. |
| `snapshot` | Thumbnail capture. |
