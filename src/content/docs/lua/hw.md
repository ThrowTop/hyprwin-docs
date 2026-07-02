---
title: hw
description: Top-level lifecycle, timers, notifications, launching, and application control.
---

## Members

| Member | Returns | Description |
| --- | --- | --- |
| `hw.bind(key, callback)` | nothing | Register a SUPER key binding. |
| `hw.binds()` | `string[]` | Return sorted registered binding names. |
| `hw.on_super(callback)` | nothing | Register the SUPER press and release callback. |
| `hw.timer(ms, callback, options?)` | `HW.Timer` | Schedule a Lua callback. |
| `hw.on_reload(callback)` | nothing | Register the pre-reload callback. |
| `hw.on_exit(callback)` | nothing | Register the pre-exit callback. |
| `hw.reload()` | `boolean` | Queue a configuration reload. |
| `hw.quit()` | `boolean` | Queue application exit. |
| `hw.log(level, message)` | nothing | Write to the [HyprWin log](/hyprwin-docs/logging/). |
| `hw.log_path()` | `string` | Return the current log file path. |
| `hw.open_log()` | `boolean` | Open the current log file. |
| `hw.msgbox(message, title?)` | nothing | Show an informational message box. |
| `hw.notify(options)` | `boolean` | Queue a tray notification. |
| `hw.run(...)` | nothing | Start a target asynchronously. |
| `hw.launch(...)` | nothing | Start an application and try to focus its new window. |
| `hw.config_path()` | `string` | Return the absolute active configuration path. |
| `hw.open_config()` | `boolean` | Open the active configuration. |

Binding details are documented under [`hw.bind`](/hyprwin-docs/lua/bind/).

## Timers

```text
hw.timer(delay_ms, callback, options?) -> HW.Timer
```

`delay_ms` is an integer from `0` through `2147483647`:

```lua
local timer = hw.timer(1000, function()
  hw.log("debug", "tick")
end, {
  repeating = true,
})
```

:::caution
Use a positive delay for repeating timers. A repeating timer with a zero
interval is accepted by the API but can keep the Lua dispatcher continuously
busy.
:::

An `HW.Timer` has two methods:

| Member | Description |
| --- | --- |
| `cancel()` | Prevent future scheduled calls. |
| `call()` | Invoke the callback immediately. |

Garbage collection cancels the timer. `call()` does not alter its deadline.

Scheduled timer callbacks run synchronously on the Lua dispatch thread. Their
errors are logged and isolated to the callback. An error from an explicit
`timer:call()` propagates to the binding, timer, or configuration operation
that called it.

## Lifecycle callbacks

```lua
hw.on_reload(function()
  hw.log("info", "configuration is reloading")
end)

hw.on_exit(function()
  hw.log("info", "HyprWin is exiting")
end)
```

Only one callback of each kind is stored. Registering another replaces the
previous callback.

The reload callback runs before the Lua state is destroyed. The exit callback
runs only through the tray **Exit** flow.

`hw.reload()` and `hw.quit()` return `true` only when they queue a new request.
They return `false` when unavailable, already queued, or called during
configuration loading or a lifecycle callback.

## Message boxes

```lua
hw.msgbox("Operation complete")
hw.msgbox("Operation complete", "My binding")
```

The default title is `HyprWin`. Message boxes are shown asynchronously.
HyprWin allows one asynchronous message box at a time, so another request while
one is open is dropped.

## Notifications

```lua
local queued = hw.notify({
  body = "Layout applied",
  title = "HyprWin",
  level = "info",
})
```

| Field | Required | Values |
| --- | --- | --- |
| `body` | yes | String |
| `title` | no | String, defaults to `HyprWin` |
| `level` | no | Notification icon: `info`, `warn`, or `error` |

`level` controls the Windows notification icon only. It does not write to the
HyprWin log and is unrelated to logger levels.

## Running and launching

Both functions accept a short form:

```text
hw.run(path, args?, admin?)
hw.launch(path, args?, admin?)
```

And an options table:

```lua
hw.run({
  path = "program.exe",
  args = "--example",
  cwd = "C:/work",
  admin = false,
})
```

`file` and `target` are accepted as aliases for `path`. `dir` is accepted as an
alias for `cwd`. When no working directory is supplied, the configuration
directory is used.

Both operations return immediately. Failures are logged.

`hw.run()` starts the target normally. `hw.launch()` tracks a newly started
process for up to three seconds and focuses a new top-level window when one is
found.

Set `admin = true` to request elevation through Windows.

## Configuration helpers

`hw.config_path()` returns the normalized absolute configuration path.
`hw.open_config()` reports whether an asynchronous open request started.

## Build information

`hw.build` is a read-only table:

| Field | Type | Description |
| --- | --- | --- |
| `VERSION` | `string` | HyprWin version. |
| `DEBUG` | `boolean` | Whether this is a debug build. |
| `ARCH` | `string` | Currently `x64`. |
| `LUAJIT_VERSION` | `string` | Embedded LuaJIT version string. |
| `LUAJIT_MODE` | `string` | Currently `shared`. |

Assigning to `hw.build` fields raises an error.
