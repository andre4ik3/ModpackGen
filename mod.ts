import { getFiles, latest, rawLoader } from "./lib/api.ts";
import { ModLoader, ModrinthFile, ModrinthPack } from "./lib/types.ts";

export { ModLoader } from "./lib/types.ts";
export type { ModrinthFile, ModrinthPack } from "./lib/types.ts";

export interface CreateModpackOptions {
  name: string;
  summary?: string;
  version: string;
  gameVersion: string;
  loader: ModLoader;
  loaderVersion?: string;
  mods: string[];
  extraFiles?: ModrinthFile[];
}

export async function createModpack(opts: CreateModpackOptions) {
  const allModFiles: ModrinthFile[] = (
    await Promise.all(
      opts.mods.map((id) => getFiles(id, opts.gameVersion, rawLoader(opts.loader))),
    )
  ).flat().map(({ file, client, server }) => ({
    downloads: [file.url],
    fileSize: file.size,
    hashes: file.hashes,
    path: `mods/${file.filename}`,
    env: { client, server },
  }));

  const modFiles = [...new Map(allModFiles.map((v) => [v.hashes.sha512, v])).values()];

  const pack: ModrinthPack = {
    formatVersion: 1,
    game: "minecraft",
    name: opts.name,
    summary: opts.summary,
    versionId: opts.version,
    files: [...modFiles, ...(opts.extraFiles || [])],
    dependencies: {
      minecraft: opts.gameVersion,
      [opts.loader]: opts.loaderVersion ?? latest(opts.gameVersion, opts.loader),
    },
  };

  return pack;
}
