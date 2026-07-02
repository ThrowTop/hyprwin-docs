---
title: hw.mon
description: Query monitors, display modes, work areas, and move windows between displays.
---

## `HW.Monitor`

`HW.Monitor` is userdata containing a snapshot of native monitor information
captured when it was created.

`rect`, `work_area`, `width`, `height`, `name`, and `is_primary` come from that
snapshot. `dpi`, `scale`, `hz`, and `bit_depth` are queried when read.

### Members

| Member | Type or return | Description |
| --- | --- | --- |
| `rect` | `rect` | Full monitor bounds in virtual desktop coordinates. |
| `work_area` | `rect` | Bounds excluding reserved areas such as the taskbar. |
| `width` | `integer` | Full monitor width. |
| `height` | `integer` | Full monitor height. |
| `is_primary` | `boolean` | Whether this is the primary monitor. |
| `name` | `string` | Windows display device name. |
| `dpi` | `point` | Effective horizontal and vertical DPI. |
| `scale` | `number` | Horizontal effective DPI divided by 96. |
| `hz` | `integer` | Current display frequency. |
| `bit_depth` | `integer` | Current bits per pixel. |
| `set_resolution(w, h, hz)` | `boolean` | Apply and persist a display mode. |
| `list_modes()` | `HW.MonitorMode[]` | Enumerate display modes reported by Windows. |
| `move_window(window)` | `boolean` | Move a window to this monitor. |

`HW.MonitorMode` contains `width`, `height`, and `hz` integer fields. Windows may
report multiple modes with the same values.

`set_resolution()` requests 32-bit color and uses
`ChangeDisplaySettingsExW` with persistent global settings. It returns whether
Windows reported success.

`move_window()` preserves the window's visual size and its offset from the
source monitor work area's top-left corner. The destination position is clamped
against the destination work area's top and left edges.

## `hw.mon`

| Member | Returns | Description |
| --- | --- | --- |
| `primary()` | `HW.Monitor` | Primary monitor snapshot. |
| `list()` | `HW.Monitor[]` | Snapshots for all current monitors. |
| `at(point)` | `HW.Monitor` | Nearest monitor to a virtual desktop point. |
| `for_window(window)` | `HW.Monitor` | Nearest monitor to a window. |
| `work_area(window?)` | `rect?` | Work area for a window, or the primary work area. |

`at()` and `for_window()` use Windows nearest-monitor fallback behavior, so they
still return a monitor when the point or window does not intersect one exactly.

Because monitor userdata contains a snapshot, reacquire monitors after changing
display topology or resolution when current bounds are required.

```lua
hw.bind("SHIFT+RIGHT", function()
  local window = hw.window.focused()
  if not window then
    return
  end

  local monitors = hw.mon.list()
  if #monitors > 1 then
    monitors[2]:move_window(window)
  end
end)
```

Monitor coordinates can be negative when a display is positioned left of or
above the primary display.
