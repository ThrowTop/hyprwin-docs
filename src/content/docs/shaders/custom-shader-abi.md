---
title: Custom Shader ABI
description: ABI contract for HyprwinV2 custom shaders.
---

This page documents the contract custom shaders must follow.

Expected sections:

- shader entry point
- required resources
- uniform layout
- coordinate space
- timing values
- color format
- compatibility notes

Example shape:

```hlsl
float4 main(float4 position : SV_POSITION) : SV_TARGET
{
    return float4(1.0, 1.0, 1.0, 1.0);
}
```

