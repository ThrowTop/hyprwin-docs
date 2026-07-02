---
title: hw.mouse
description: Query and synthesize mouse input.
---

| Member | Returns | Description |
| --- | --- | --- |
| `pos()` | `point` | Current cursor position. |
| `move(point)` | nothing | Move the cursor. |
| `click(button, point?)` | nothing | Click at the current or supplied position. |
| `down(button)` | nothing | Send a button-down event. |
| `up(button)` | nothing | Send a button-up event. |
| `scroll(delta)` | nothing | Scroll by a number of wheel notches. |

Accepted buttons are `left`, `right`, and `middle`.

Positions use virtual desktop coordinates. Supplying a point moves the cursor
before clicking:

```lua
hw.mouse.click("left", point(100, 200))
```

`scroll(1)` sends one wheel notch upward; `scroll(-1)` sends one downward.
