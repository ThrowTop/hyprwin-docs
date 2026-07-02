---
title: hw.input
description: Send keyboard input and inspect keyboard state.
---

These APIs synthesize input through Windows. HyprWin marks and ignores its own
injected keyboard events, so `hw.input.send()` does not recursively trigger
HyprWin bindings.

| Member | Returns | Description |
| --- | --- | --- |
| `send(combo)` | `boolean` | Press and release a key combination. |
| `send_text(text)` | nothing | Send text as Unicode keyboard input. |
| `is_down(key)` | `boolean` | Query the current physical or logical down state. |
| `get_toggle(key)` | `boolean` | Query a key's toggle bit. |
| `toggle(key)` | nothing | Press and release one key. |
| `lang()` | `string?` | Foreground window keyboard layout locale. |
| `lang_list()` | `string[]` | Loaded keyboard layout locales. |
| `set_lang(name)` | nothing | Request a loaded layout for the foreground window. |
| `next_lang()` | nothing | Request the next loaded layout for the foreground window. |

### Sending a combination

```lua
hw.input.send("SUPER+SHIFT+S")
```

The parser accepts the same non-modifier key names as
[`hw.bind`](/hyprwin-docs/lua/bind/), plus these modifier aliases:

```text
SUPER WIN LSUPER LWIN RSUPER RWIN
SHIFT LSHIFT RSHIFT
CTRL CONTROL LCTRL LCONTROL RCTRL RCONTROL
ALT LALT RALT
```

Generic `SUPER`, `SHIFT`, `CTRL`, and `ALT` select the left-side key. Modifiers
are pressed in source order, the main key is pressed and released, then
modifiers are released in reverse order.

The combination must contain exactly one non-modifier key and at most eight
modifier tokens. Invalid combinations raise a Lua error. The boolean reports
whether Windows accepted every generated event.

### Sending text

```lua
hw.input.send_text("Hello")
```

Text is converted from UTF-8 and sent as Unicode key-down and key-up events.
This does not use the active keyboard layout to produce characters.

### Key state

`is_down()` uses `GetAsyncKeyState`. `get_toggle()` reads the toggle bit from
`GetKeyState` and is mainly useful for keys such as `CAPSLOCK`, `NUMLOCK`, and
`SCROLLLOCK`.

`toggle()` sends one key-down and key-up pair. It accepts modifiers and normal
keys, despite its name.

Unknown key names raise a Lua error.

### Keyboard layouts

Layout names use Windows locale names such as `en-US`. The current layout is
read from the foreground window's thread.

`set_lang()` requires an exact name returned by `lang_list()` and raises an
error if that layout is not loaded. Layout changes are posted to the foreground
window and occur asynchronously.
