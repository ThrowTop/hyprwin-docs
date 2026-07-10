---
title: hw.window
description: The HW.Window userdata and hw.window API.
---

## `HW.Window`

`HW.Window` is an opaque Lua userdata representing a native Windows window.
It is not a table and does not expose fields directly.

Internally, the userdata contains:

- the native window handle (`HWND`)
- the process ID that owned the handle when the userdata was created

HyprWin checks both values whenever the userdata is used. This prevents an old
`HW.Window` from targeting a different process if Windows reuses its handle.
Using a window after it has been destroyed raises a `stale window` Lua error.

These values are not exposed as Lua fields. All public members are methods and
are evaluated when called. Window metadata is not cached in the userdata.

Windows can disappear at any time, so retrieve them close to where they are
used:

```lua
hw.bind("Q", function()
  local window = hw.window.at_cursor()
  if window then
    window:close()
  end
end)
```

### Members

Methods use Lua's `:` syntax:

```lua
local title = window:title()
```

| Member | Returns | Description |
| --- | --- | --- |
| `title()` | `string` | Window title, or an empty string if it cannot be read. |
| `class()` | `string` | Win32 window class name, or an empty string if unavailable. |
| `pname()` | `string` | Process executable name, or an empty string if unavailable. |
| `pid()` | `integer?` | Process ID, or `nil` if unavailable. |
| `hwnd()` | `integer` | Native Win32 window handle. |
| `visual_rect()` | `rect?` | Visible window bounds, or `nil` if unavailable. |
| `set_visual_rect(bounds)` | `boolean` | Moves and resizes the visible frame to `bounds`. |
| `get_maximized()` | `boolean` | Whether Windows marks the window as maximized. |
| `get_minimized()` | `boolean` | Whether Windows marks the window as minimized. |
| `get_fullscreen()` | `boolean` | Whether the window is borderless and fills its nearest monitor. |
| `get_resizable()` | `boolean` | Whether the window has the Win32 resizable-frame style. |
| `maximize()` | `boolean` | Requests the maximized state. |
| `minimize()` | `boolean` | Requests the minimized state. |
| `restore()` | `boolean` | Requests the restored state. |
| `close()` | `boolean` | Posts a normal close request. |
| `kill()` | `boolean` | Terminates the owning process immediately. |
| `responsive(timeout_ms?)` | `boolean` | Waits for the window to answer a no-op message. |
| `focus()` | nothing | Restores, raises, and requests focus for the window. |
| `dump()` | `table` | Returns the available window metadata in one table. |

### Native handle

`hwnd()` returns the native Win32 `HWND` as an integer. Like every
`HW.Window` method, it validates that the underlying handle still belongs to
the process recorded when the userdata was created; a stale window raises a
`stale window` Lua error.

### Geometry

`visual_rect()` and `set_visual_rect()` use visual bounds: the visible frame
reported by Desktop Window Manager, excluding invisible resize borders and
shadows. If DWM bounds cannot be read, `visual_rect()` falls back to raw
`GetWindowRect` bounds.

Coordinates use the virtual desktop coordinate space and may be negative.
The returned `rect` stores four coordinate fields:

- `x` and `y` are the top-left coordinates.
- `x2` and `y2` are the bottom-right coordinates.
- `w` is a read-only property computed as `x2 - x`.
- `h` is a read-only property computed as `y2 - y`.

Because `w` and `h` are computed when read, they remain correct if a stored
coordinate changes. Assigning directly to `w` or `h` raises a Lua error.

`set_visual_rect()` compensates for the difference between the visual and raw
frames before moving the window. It returns `false` if the window does not
respond within 200 ms or the underlying move fails.

### State changes

`maximize()`, `minimize()`, and `restore()` reject a window that does not answer
within 200 ms, then call the corresponding Win32 `ShowWindow` operation.

:::caution
Their boolean currently comes directly from `ShowWindow`. It describes whether
the window was previously visible, not whether the requested state change
succeeded. Query the resulting state when confirmation matters.
:::

`get_fullscreen()` specifically detects a borderless window whose raw bounds
exactly match its nearest monitor. Application-specific fullscreen modes may
not satisfy that test.

### Closing and killing

`close()` posts `WM_CLOSE`. A `true` result means Windows queued the request;
the application can still ignore or cancel it.

`kill()` calls `TerminateProcess` with exit code `1`.

:::danger
`kill()` does not allow the application to save data. Prefer `close()` unless
forced termination is intentional.
:::

### Responsiveness and focus

`responsive()` waits up to 200 ms by default. A custom timeout can be supplied:

```lua
if not window:responsive(50) then
  hw.log("warn", "window is not responding")
end
```

The call is synchronous. Large timeouts block Lua binding dispatch and Lua
timers.

`focus()` restores a minimized window, raises it, and asks Windows to make it
the foreground window. It has no return value, and Windows foreground
activation rules can still prevent the focus change.

### `dump()` result

```text
{
  hwnd = integer,
  process = string,
  title = string,
  class = string,
  pid = integer?,
  raw_rect = rect?,
  visual_rect = rect?,
  maximized = boolean,
  minimized = boolean,
  fullscreen = boolean,
  resizable = boolean,
}
```

`raw_rect` is the result of Win32 `GetWindowRect`. `visual_rect` is the visible
DWM frame when available. `hwnd` is the native window handle represented as an
integer.

## `hw.window`

`hw.window` contains the functions used to obtain `HW.Window` values.

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `at_cursor()` | `HW.Window?` | Eligible top-level application window under the cursor. |
| `focused()` | `HW.Window?` | Current foreground window. |
| `list(filter?)` | `HW.Window[]` | Current top-level application windows, optionally filtered. |

### `hw.window.at_cursor()`

Returns `nil` if there is no eligible window under the cursor. HyprWin excludes
windows it identifies as minimized, cloaked, transparent, shell-protected, or
invisible.

### `hw.window.focused()`

Returns the foreground window reported by Windows, or `nil` when Windows does
not report a valid one. Unlike `at_cursor()`, this function does not apply the
application-window eligibility filter.

### `hw.window.list(filter?)`

Without an argument, returns the current top-level application windows in
Windows enumeration order.

A filter function receives each `HW.Window`. Only truthy results are retained:

```lua
local notepads = hw.window.list(function(window)
  return window:pname():lower() == "notepad.exe"
end)
```

The filter runs synchronously and is not protected separately. An error
propagates to the HyprWin operation currently executing:

- If `hw.window.list()` runs while the configuration file is loading, the error
  fails the entire configuration load and HyprWin enters safe mode.
- If it runs inside a binding, the error aborts only that binding invocation
  and is written to the log.
