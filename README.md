# ModpackGen

A cool library for dynamically generating Modrinth packs.

## Advantages

- Automatically select best and latest mod version for game version
- Automatically pull in required dependencies
- Change game/loader version with ease

## Usage

This will generate a Modrinth file with the latest mod versions for the latest Forge on 1.20.1:

```ts
import { createModpack, ModLoader } from "./mod.ts";

const pack = await createModpack({
  name: "Test Modpack",
  version: "1.0",
  gameVersion: "1.20.1",
  loader: ModLoader.Forge,
  mods: [
    "create",
    "entityculling",
    "ferrite-core",
    "jade",
    "no-chat-reports",
    "oculus",
    "rubidium",
    "simple-voice-chat",
  ],
});

await Deno.writeTextFile("./modrinth.index.json", JSON.stringify(pack));
```

You can include extra custom files using `extraFiles` property (e.g. CurseForge mods).

This library only generates the `modrinth.index.json` file.
