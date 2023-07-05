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
