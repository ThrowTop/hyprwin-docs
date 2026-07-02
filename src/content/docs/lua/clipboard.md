---
title: hw.clipboard
description: Read and write the Windows clipboard.
---

| Member | Returns | Description |
| --- | --- | --- |
| `get()` | `string?` | Read Unicode text. |
| `set(text)` | nothing | Replace clipboard contents with Unicode text. |
| `get_files()` | `string[]?` | Read file-drop paths. |

`get()` returns `nil` when Unicode text is unavailable. `get_files()` returns
`nil` when file-drop data is unavailable.

```lua
local files = hw.clipboard.get_files()
if files then
  for _, path in ipairs(files) do
    hw.log("info", path)
  end
end
```

Clipboard operations are synchronous and can fail while another application
owns the clipboard.
