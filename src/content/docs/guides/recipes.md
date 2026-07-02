---
title: Recipes
description: Small source-compatible HyprWin configuration patterns.
---

See the [`hw` API](/hyprwin-docs/lua/hw/) for behavioral details.

## Close the window under the cursor

```lua
hw.bind("Q", function()
  local window = hw.window.at_cursor()
  if not window then
    return
  end

  if window:responsive() then
    window:close()
  else
    window:kill()
  end
end)
```

## Toggle maximized state

```lua
hw.bind("F", function()
  local window = hw.window.at_cursor()
  if not window then
    return
  end

  if window:get_maximized() then
    window:restore()
  else
    window:maximize()
  end
end)
```

## Place the focused window on the left half

```lua
hw.bind("LEFT", function()
  local window = hw.window.focused()
  if not window then
    return
  end

  local area = hw.mon.work_area(window)
  if not area then
    return
  end

  window:set_visual_rect(
    rect.xywh(area.x, area.y, math.floor(area.w / 2), area.h)
  )
end)
```

## Launch applications

```lua
hw.bind("RETURN", function()
  hw.launch("wt.exe")
end)

hw.bind("E", function()
  hw.run("explorer.exe")
end)
```

## Forward a Windows shortcut

```lua
hw.bind("V", function()
  hw.input.send("SUPER+V")
end)
```

## Adjust master volume

```lua
local function adjust_volume(delta)
  local current = hw.audio.volume()
  if current then
    hw.audio.volume(current + delta)
  end
end

hw.bind("PAGEUP", function()
  adjust_volume(0.05)
end)

hw.bind("PAGEDOWN", function()
  adjust_volume(-0.05)
end)

hw.bind("M", function()
  hw.audio.mute("toggle")
end)
```

## Cycle keyboard layout

```lua
hw.bind("SPACE", function()
  hw.input.next_lang()
end)
```

## Keep state in a file

```lua
local state_path = "data/counter.txt"

hw.fs.mkdir("data")

hw.bind("C", function()
  local text = hw.fs.read(state_path)
  local count = tonumber(text) or 0
  count = count + 1

  local ok, err = hw.fs.write(state_path, tostring(count))
  if not ok then
    hw.log("error", err)
  end
end)
```
