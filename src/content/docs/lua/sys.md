---
title: hw.sys
description: Windows system, registry, and native message helpers.
---

| Member | Returns | Description |
| --- | --- | --- |
| `lock()` | `boolean` | Lock the current Windows workstation. |
| `env(name)` | `string?` | Read an environment variable. |
| `username()` | `string?` | Read the current Windows username. |
| `debug_console(value?)` | `boolean` | Query or control the log viewer. |
| `send_notify_message(hwnd, msg, wparam?, lparam?)` | nothing | Send a low-level asynchronous window message. |
| `reg_get(key, name?)` | `string`, `integer`, or `nil` | Read a registry value. |
| `reg_set(key, name, value)` | `boolean` | Write a string or DWORD value. |
| `reg_exists(key, name?)` | `boolean` | Test a key or value. |
| `reg_delete(key, name?)` | `boolean` | Delete a value or non-recursive key. |

### Environment and user

`env()` returns `nil` when the variable does not exist or cannot be read.
Environment values come from the HyprWin process environment.

`username()` returns `nil` if `GetUserNameW` fails.

### Log viewer

```lua
hw.sys.debug_console()          -- current open state
hw.sys.debug_console(true)      -- open
hw.sys.debug_console(false)     -- close
hw.sys.debug_console("toggle")  -- toggle
```

Opening returns whether the viewer is open after the request. Closing returns
`true`. Toggling returns the resulting state. See [Logging](/hyprwin-docs/logging/).

### Registry

Accepted registry hive names are:

| Short name | Full name |
| --- | --- |
| `HKCU` | `HKEY_CURRENT_USER` |
| `HKLM` | `HKEY_LOCAL_MACHINE` |
| `HKCR` | `HKEY_CLASSES_ROOT` |
| `HKU` | `HKEY_USERS` |
| `HKCC` | `HKEY_CURRENT_CONFIG` |

Both slash styles are accepted in key paths.

```lua
local value = hw.sys.reg_get(
  "HKCU/Software/Microsoft/Windows/CurrentVersion/Themes/Personalize",
  "AppsUseLightTheme"
)
```

Omit `name` to access the registry key's default value with `reg_get()`, test
the key itself with `reg_exists()`, or delete the key with `reg_delete()`.

`reg_get()` supports `REG_SZ`, `REG_EXPAND_SZ`, `REG_DWORD`, and `REG_QWORD`.
Expandable strings are returned without expanding environment variables.
Unsupported types return `nil`.

`reg_set()` writes Lua strings as `REG_SZ`. Numeric values are converted to
32-bit `REG_DWORD`. It creates missing keys.

Deleting a key is non-recursive and fails when the key has subkeys.

:::danger
Release HyprWin normally runs elevated. Registry writes and deletes therefore
have the privileges of an administrator. Validate paths and values carefully.
:::

### Native window messages

```lua
hw.sys.send_notify_message(hwnd, message, wparam, lparam)
```

This is a low-level wrapper over `SendNotifyMessageW`. All four values are
integers, with `wparam` and `lparam` defaulting to zero. The function has no
success result.

:::danger
This API can send arbitrary messages to native windows and should only be used
when the target message contract is known. The `hwnd` integer can be obtained
from `HW.Window:dump()`.
:::
