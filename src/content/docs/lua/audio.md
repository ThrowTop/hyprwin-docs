---
title: hw.audio
description: Control default endpoints, enumerate devices, and adjust application sessions.
---

HyprWin uses Windows Core Audio. Scalar volume values range from `0.0` through
`1.0`; setters clamp values to that range.

## Default playback endpoint

| Member | Returns | Description |
| --- | --- | --- |
| `hw.audio.volume()` | `number?` | Read scalar master volume. |
| `hw.audio.volume(value)` | nothing | Set scalar master volume. |
| `hw.audio.volume_db()` | `number?` | Read master volume in decibels. |
| `hw.audio.volume_db(value)` | nothing | Set master volume in decibels. |
| `hw.audio.mute()` | `boolean?` | Read mute state. |
| `hw.audio.mute(value)` | nothing | Set mute state or toggle it. |

The setter form of `mute` accepts `true`, `false`, or `"toggle"`:

```lua
hw.bind("M", function()
  hw.audio.mute("toggle")
end)
```

Decibel setters query the endpoint's supported range and clamp the value before
applying it. Getter forms return `nil` when no usable default endpoint or volume
interface is available.

## Devices

| Member | Returns | Description |
| --- | --- | --- |
| `playback_default()` | `HW.AudioDevice?` | Default playback endpoint. |
| `capture_default()` | `HW.AudioDevice?` | Default capture endpoint. |
| `playback_devices()` | `HW.AudioDevice[]` | Active playback endpoints. |
| `capture_devices()` | `HW.AudioDevice[]` | Active capture endpoints. |
| `cycle()` | nothing | Select the next active playback endpoint. |
| `cycle_capture()` | nothing | Select the next active capture endpoint. |

Cycling follows Windows enumeration order. It does nothing when zero or one
active endpoint is available.

### `HW.AudioDevice`

An audio device userdata holds native interfaces for the endpoint that was
enumerated.

| Member | Type or return | Description |
| --- | --- | --- |
| `id` | `string` | Windows endpoint ID. |
| `name` | `string` | Friendly device name. |
| `default` | `boolean` | Whether it was default when enumerated. |
| `volume()` | `number?` | Read scalar endpoint volume. |
| `volume(value)` | nothing | Set scalar endpoint volume. |
| `volume_db()` | `number?` | Read endpoint volume in decibels. |
| `volume_db(value)` | nothing | Set endpoint volume in decibels. |
| `volume_range()` | `HW.VolumeRange?` | Supported decibel range. |
| `mute()` | `boolean?` | Read endpoint mute state. |
| `mute(value)` | nothing | Set or toggle endpoint mute state. |
| `set_default()` | `boolean` | Request this endpoint as default. |

`HW.VolumeRange` contains `min`, `max`, and `step` decibel values.

The `default` property is a snapshot. Call the enumeration function again after
changing the default device if current default flags are needed.

`set_default()` attempts to set the endpoint for console, multimedia, and
communications roles. It returns `true` if at least one role succeeds.

## Application sessions

```text
hw.audio.sessions(device?) -> HW.AudioSession[]
```

With no argument, sessions are enumerated from the default playback endpoint.
An explicit argument must be a playback `HW.AudioDevice`; passing a capture
device raises an error.

```lua
for _, session in ipairs(hw.audio.sessions()) do
  if session.process:lower() == "spotify.exe" then
    session:volume(0.5)
  end
end
```

### `HW.AudioSession`

| Member | Type or return | Description |
| --- | --- | --- |
| `id` | `string` | Session identifier. |
| `instance_id` | `string` | Session instance identifier. |
| `device_id` | `string` | Endpoint ID containing the session. |
| `pid` | `integer?` | Owning process ID. |
| `process` | `string` | Process executable name when available. |
| `name` | `string` | Display name, falling back to process name. |
| `state` | `string` | `active`, `inactive`, `expired`, or `unknown`. |
| `volume()` | `number?` | Read scalar session volume. |
| `volume(value)` | nothing | Set scalar session volume. |
| `mute()` | `boolean?` | Read session mute state. |
| `mute(value)` | nothing | Set or toggle session mute state. |

Identity and state fields are snapshots captured during enumeration. Volume and
mute methods call the retained native session interface.

Audio setter failures are written to the log. Most setter methods have no
return value.
