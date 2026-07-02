---
title: hw.bind
description: Register SUPER key combinations with hw.bind.
---

```lua
hw.bind("SHIFT+Q", function()
  local window = hw.window.at_cursor()
  if window then
    window:close()
  end
end)
```

## Signature

```text
hw.bind(key: string, callback: fun())
```

The key is case-insensitive, ignores token whitespace, and must contain exactly
one non-modifier key.

## Modifiers

| Token | Meaning |
| --- | --- |
| `SHIFT` | Either left or right Shift |
| `CTRL`, `CONTROL` | Either left or right Control |
| `ALT` | Either left or right Alt |
| `LSHIFT`, `RSHIFT` | A specific Shift key |
| `LCTRL`, `LCONTROL` | Left Control |
| `RCTRL`, `RCONTROL` | Right Control |
| `LALT`, `RALT` | A specific Alt key |

Generic modifiers expand to both side-specific forms.

Do not include `SUPER`, `LWIN`, or `RWIN` in the binding string. The configured
SUPER key activates the binding layer.

## Supported keys

Letters `A` through `Z`, digits `0` through `9`, and function keys `F1` through
`F24` are supported.

Named keys include:

```text
BACKSPACE  TAB        RETURN     ENTER       ESC
ESCAPE     SPACE      PAGEUP     PAGEDOWN    END
HOME       LEFT       UP         RIGHT       DOWN
INSERT     DELETE     PAUSE      PRINTSCREEN SNAPSHOT
CAPSLOCK   NUMLOCK    SCROLLLOCK
PERIOD     COMMA      MINUS      PLUS        SLASH
BACKSLASH  SEMICOLON  QUOTE      LBRACKET    RBRACKET
NUMPAD0 through NUMPAD9
MULTIPLY   ADD        SUBTRACT   DECIMAL     DIVIDE
```

An invalid binding causes a configuration error when registered.

:::note
`PAUSE`, `PRINTSCREEN`, and `SNAPSHOT` are accepted by the shared key parser,
but the current low-level keyboard hook does not dispatch those keys to
`hw.bind()` callbacks.
:::

## Dispatch behavior

Bindings run synchronously with a 50 ms Lua bytecode watchdog. Native API calls
cannot be interrupted and may delay other bindings and timers.

An error or timeout aborts only the current binding and is written to the log.
It does not place HyprWin in safe mode.

Repeated key-down messages are ignored until the key is released.

## Inspect registered bindings

```lua
for _, binding in ipairs(hw.binds()) do
  print(binding)
end
```

`hw.binds()` returns sorted, side-specific names; `SHIFT+Q` appears as
`LSHIFT+Q` and `RSHIFT+Q`.

## SUPER state callback

```lua
hw.on_super(function(pressed)
  hw.log("debug", pressed and "SUPER pressed" or "SUPER released")
end)
```

The callback receives `true` on press and `false` on release. A new registration
replaces the previous one.
