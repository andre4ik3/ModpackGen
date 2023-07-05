import { FileHashes, FilePresence, ModLoader } from "./types.ts";

const BASE = "https://api.modrinth.com/v2";

export async function latest(game: string, loader: ModLoader): Promise<string> {
  if (loader === ModLoader.Forge) {
    const data = await fetch(
      "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json",
    ).then((r) => r.json());
    return data["promos"][`${game}-recommended`] || data["promos"][`${game}-latest`];
  } else if (loader === ModLoader.Fabric) {
    const data = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${game}`)
      .then((r) => r.json());
    return data[0]["loader"]["version"];
  }

  throw new Error(
    `Automatic latest version for ${loader} not yet implemented. Please specify a version manually.`,
  );
}

export function rawLoader(loader: ModLoader) {
  switch (loader) {
    case ModLoader.Forge:
      return RawLoader.Forge;
    case ModLoader.Fabric:
      return RawLoader.Fabric;
    case ModLoader.Quilt:
      return RawLoader.Quilt;
    default:
      throw new Error("unreachable");
  }
}

export enum RawLoader {
  Forge = "forge",
  Fabric = "fabric",
  Quilt = "quilt",
}

export interface GetProjectResponse {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: FilePresence;
  server_side: FilePresence;
  body: string;
  additional_categories: string[];
  project_type: string;
  id: string;
  team: string;
  versions: string[];
  game_versions: string[];
  loaders: RawLoader[];
}

export interface GetVersionResponse {
  name: string;
  version_number: string;
  dependencies: {
    version_id: string;
    project_id: string;
    file_name: string;
    dependency_type: FilePresence;
  }[];
  game_versions: string[];
  loaders: RawLoader[];
  status: string;
  id: string;
  project_id: string;
  author_id: string;
  files: {
    hashes: FileHashes;
    url: string;
    filename: string;
    primary: boolean;
    size: number;
    file_type: string;
  }[];
}

export type ModFile = {
  file: GetVersionResponse["files"][number];
  client: FilePresence;
  server: FilePresence;
};

export async function fetchProject(id: string) {
  const resp = await fetch(`${BASE}/project/${id}`);
  if (!resp.ok) throw new Error(`error while fetching project ${id}: ${resp.status}`);
  const data: GetProjectResponse = await resp.json();
  return data;
}

export async function fetchVersion(id: string) {
  const resp = await fetch(`${BASE}/version/${id}`);
  if (!resp.ok) throw new Error(`error while fetching version ${id}: ${resp.status}`);
  const data: GetVersionResponse = await resp.json();
  return data;
}

export async function getFiles(
  mod: string,
  gameVersion: string,
  loader: RawLoader,
): Promise<ModFile[]> {
  const project = await fetchProject(mod);
  if (!project.game_versions.includes(gameVersion)) {
    throw new Error(`${project.title} (${project.slug}) is not compatible with ${gameVersion}`);
  } else if (!project.loaders.includes(loader)) {
    throw new Error(`${project.title} (${project.slug}) is not compatible with ${loader}`);
  }

  for (const versionId of project.versions.reverse()) {
    const version = await fetchVersion(versionId);

    if (version.status !== "listed") continue;
    else if (!version.game_versions.includes(gameVersion)) continue;
    else if (!version.loaders.includes(loader)) continue;

    // version is "probably good"
    const file = version.files.find((file) => file.primary)!;
    const dependencies = await Promise.all(
      version.dependencies
        .filter((dep) => dep.dependency_type === "required")
        .map((dep) => getFiles(dep.project_id, gameVersion, loader)),
    );

    // TODO: Add support for optional and dedicated server only mods.
    const client = FilePresence.Required;
    const server = project.server_side !== "unsupported"
      ? FilePresence.Required
      : FilePresence.Unsupported;

    return [{ file, client, server }, ...dependencies.flat()];
  }

  throw new Error(`Failed to find a suitable version of ${project.title} (${project.slug})`);
}
