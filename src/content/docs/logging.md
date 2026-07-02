---
title: Logging
description: Find and inspect HyprWin startup, native, and Lua diagnostics.
---

HyprWin writes startup, configuration, binding, shader, and native subsystem
diagnostics to a timestamped file under `logs/` beside the executable. It keeps
the five most recent run logs.

## Log levels

| Level | Purpose |
| --- | --- |
| `trace` | Detailed execution tracing. |
| `debug` | Development diagnostics. |
| `info` | Normal lifecycle and status messages. |
| `warn` | Recoverable failures or degraded behavior. |
| `error` | Failed operations requiring attention. |
| `critical` | Fatal or unrecoverable failures. |

Release builds compile out `trace` and `debug` messages. Warning and higher
messages are flushed to disk immediately.

## Open the log

Use the tray log viewer or these Lua functions:

```lua
hw.open_log()
hw.sys.debug_console(true)
```

`hw.open_log()` opens the current file in its associated application.
`hw.sys.debug_console()` queries, opens, closes, or toggles HyprWin's live log
viewer:

```lua
hw.sys.debug_console()          -- current state
hw.sys.debug_console(true)      -- open
hw.sys.debug_console(false)     -- close
hw.sys.debug_console("toggle")  -- toggle
```

The viewer receives recent buffered messages and supports search and level
filtering.

## Write from Lua

```lua
hw.log("info", "configuration loaded")
```

`hw.log(level, message)` accepts all six levels listed above and prefixes the
message as Lua output. An unknown level currently falls back to `info`.

`hw.log_path()` returns the current absolute log file path.
