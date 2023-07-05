export type FileHashes = { sha1: string; sha512: string };

/* ========================================================================== */
/* Pack                                                                       */
/* ========================================================================== */

export interface ModrinthPack {
  formatVersion: 1;
  game: "minecraft";
  versionId: string;
  name: string;
  summary?: string;
  files: ModrinthFile[];
  dependencies: { minecraft: string } & { [key in ModLoader]?: string };
}

export interface ModrinthFile {
  path: string;
  hashes: FileHashes;
  env?: { client: FilePresence; server: FilePresence };
  downloads: string[];
  fileSize: number;
}

export enum FilePresence {
  Required = "required",
  Optional = "optional",
  Unsupported = "unsupported",
}

export enum ModLoader {
  Forge = "forge",
  Fabric = "fabric-loader",
  Quilt = "quilt-loader",
}
