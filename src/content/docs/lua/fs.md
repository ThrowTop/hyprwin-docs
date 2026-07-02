---
title: hw.fs
description: Read, write, and inspect filesystem paths.
---

## Paths

Every relative path passed to `hw.fs` is resolved against the directory
containing the active `hyprwin.lua`. Paths must be valid UTF-8 and cannot contain
embedded null bytes.

```lua
local data, err = hw.fs.read("data/state.txt")
```

Absolute paths are used directly. Paths are lexically normalized, but the API
does not restrict access to the configuration directory.

| Member | Returns | Description |
| --- | --- | --- |
| `exists(path)` | `boolean` | Whether a filesystem entry exists. |
| `is_file(path)` | `boolean` | Whether the path is a regular file. |
| `is_dir(path)` | `boolean` | Whether the path is a directory. |
| `list(path)` | `hw_fs_entry[]?, string?` | List one directory. |
| `read(path)` | `string?, string?` | Read a complete binary file. |
| `write(path, data)` | `boolean, string?` | Replace a file with the supplied bytes. |
| `mkdir(path)` | `boolean, string?` | Create a directory and missing parents. |

`exists()`, `is_file()`, and `is_dir()` return `false` for both a negative result
and a filesystem query error.

The other operations return a result followed by an optional error:

```lua
local ok, err = hw.fs.write("data/state.txt", "ready")
if not ok then
  hw.log("error", err)
end
```

`write()` opens the destination with truncation. It does not create missing
parent directories and does not perform an atomic temporary-file replacement.

### Directory entries

`list()` returns entries in filesystem iteration order. It does not sort or
recurse.

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Final filename component. |
| `path` | `string` | Normalized path. |
| `type` | `string` | `file`, `directory`, `symlink`, or `other`. |
| `ext` | `string` | Extension including its leading period, or an empty string. |
| `size` | `integer?` | Byte size for a regular file when available. |

The type uses the entry's symlink status, so a symlink is reported as
`symlink` rather than as its target type.
