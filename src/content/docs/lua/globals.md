---
title: Globals and Standard Library
description: HyprWin global values and Lua standard library extensions.
---

HyprWin loads several global value constructors before executing
`hyprwin.lua`.

## `point`

```lua
local position = point(100, 200)
```

| Field | Type |
| --- | --- |
| `x` | `integer` |
| `y` | `integer` |

| Method | Returns |
| --- | --- |
| `offset(dx, dy)` | `point` |
| `length()` | `number` |
| `distance(other)` | `number` |
| `clamp(low, high)` | `point` |

Points support `+`, `-`, multiplication by a number, division by a number,
unary negation, and equality.

## `rect`

Construct a rectangle from endpoints:

```lua
local bounds = rect(x, y, x2, y2)
```

Or from position and size:

```lua
local bounds = rect.xywh(x, y, width, height)
```

`x`, `y`, `x2`, and `y2` are stored coordinates. `w` and `h` are read-only
properties computed from those coordinates whenever they are read:

```lua
assert(bounds.w == bounds.x2 - bounds.x)
assert(bounds.h == bounds.y2 - bounds.y)
```

Assigning to `w` or `h` raises an error.

| Method | Returns | Description |
| --- | --- | --- |
| `offset(dx, dy)` | `rect` | Moves without resizing. |
| `inset(x, y?)` | `rect` | Insets each edge. `y` defaults to `x`. |
| `grow(amount)` | `rect` | Expands each edge. |
| `pos()` | `point` | Top-left position. |
| `size()` | `point` | Width and height. |
| `center()` | `point` | Integer center point. |
| `with_pos(x, y)` | `rect` | Same size at a new position. |
| `with_size(w, h)` | `rect` | Same position with a new size. |
| `aspect()` | `number` | Width divided by height. |
| `is_empty()` | `boolean` | Whether width or height is non-positive. |
| `contains(point)` | `boolean` | Half-open point containment test. |
| `intersects(other)` | `boolean` | Whether two rectangles overlap. |
| `intersection(other)` | `rect?` | Overlap, or `nil`. |
| `union(other)` | `rect` | Bounds containing both rectangles. |
| `clamp(bounds)` | `rect` | Repositions this rectangle inside bounds. |
| `center_in(bounds)` | `rect` | Centers this rectangle inside bounds. |

Rectangles support `+`, `-`, multiplication by a number, division by a number,
and equality.

## `color`

Color constructors return `HW.Color` values:

```lua
color.hex("00a2ff")
color.hex("#00a2ff", 128)
color.rgb(0, 162, 255)
color.rgba(0, 162, 255, 128)
color.rgbf(0.0, 0.64, 1.0)
color.rgbaf(0.0, 0.64, 1.0, 0.5)
```

Integer components are clamped to `0` through `255`. Float components are
clamped to `0.0` through `1.0`.

`HW.Color` exposes `r`, `g`, `b`, and `a` byte fields plus:

| Method | Returns |
| --- | --- |
| `hex()` | Six-character lowercase RGB string |
| `with_alpha(alpha)` | New color using a byte alpha |
| `with_alphaf(alpha)` | New color using a normalized alpha |

## Standard library extensions

HyprWin adds:

| Function | Purpose |
| --- | --- |
| `math.clamp(value, low, high)` | Clamp a number. |
| `math.round(value)` | Round using `floor(value + 0.5)`. |
| `math.lerp(a, b, t)` | Linear interpolation. |
| `math.sign(value)` | Return `-1`, `0`, or `1`. |
| `string.starts_with(value, prefix)` | Prefix test. |
| `string.ends_with(value, suffix)` | Suffix test. |
| `string.matches_any(value, patterns)` | Test Lua patterns in order. |
| `table.merge(a, b)` | Shallow merge into a new table. |
| `table.map(array, fn)` | Transform array values. |
| `table.filter(array, fn)` | Retain matching array values. |
| `table.inspect(value, options?)` | Format a value for inspection. |
| `pprint(...)` | Print inspected values separated by tabs. |

`table.inspect` detects table cycles and defaults to a maximum depth of six.
Pass `{ max_depth = number }` to change the limit.
