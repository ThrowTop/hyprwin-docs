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
  resize_corner = "closest",
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
| `resize_corner` | `string` | `"closest"` | Corner used for SUPER plus right-button resizing. |
| `grab_filters` | `table[]` | empty | Ordered mouse target include and exclude rules. |
| `debug` | proxy table | all disabled | Runtime diagnostics. |

Numeric settings must be finite numbers. The native settings boundary does not
otherwise clamp these values.

An invalid field assignment is rejected and written to the log. Invalid
individual assignments do not themselves raise a Lua error.

## Colors

`colors` must be a dense array containing 1 through 16 `HW.Color` values. Sparse
arrays, non-numeric keys, and values of another type are rejected.

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

The rule table accepts only `action`, `process`, and `class`. The array must be
dense and cannot contain other keys.

## Debug settings

| Field | Type | Description |
| --- | --- | --- |
| `trace_binds` | `boolean` | Log binding dispatch. |
| `bench_binds` | `boolean` | Log binding execution time in microseconds. |
| `trace_grabs` | `boolean` | Log mouse target selection decisions. |
| `trace_super` | `boolean` | Log SUPER press and release dispatch. |
| `trace_timeout` | `boolean` | Warn when guarded Lua calls approach their timeout. |
| `last_config_load_ms` | `integer` | Last successful configuration load duration. Read-only. |

```lua
hw.settings.debug.trace_grabs = true
```

Assigning a complete `debug` table applies recognized fields. Unknown debug
fields are logged. Directly assigning an unknown field on
`hw.settings.debug` raises an error.

Direct writes to a nested debug field update the Lua runtime's pending settings
but do not publish a new cross-thread settings snapshot. This matters for
`trace_grabs`, which is read by the mouse subsystem. To change that field after
configuration loading, assign it through a debug table on the top-level proxy:

```lua
hw.settings.debug = {
  trace_grabs = true,
}
```

Omitted debug fields retain their current values.
