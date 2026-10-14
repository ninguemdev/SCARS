import fs from "node:fs";
import { pathToFileURL } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** The version of a release tag such as "v0.2.0". */
export function versionFromTag(tag) {
  const version = tag.replace(/^v/, "");
  if (!SEMVER.test(version)) throw new Error(`Release tag "${tag}" is not a version like v1.2.3`);
  return version;
}

/**
 * The system.json shipped with a release. The manifest keeps pointing at the latest release, so Foundry finds
 * updates; the download points at this release's zip, so installing this manifest always gets this version.
 */
export function buildReleaseManifest(manifest, tag) {
  const releases = `${manifest.url}/releases`;
  return {
    ...manifest,
    version: versionFromTag(tag),
    manifest: `${releases}/latest/download/system.json`,
    download: `${releases}/download/${tag}/scars.zip`
  };
}

function main([tag, file = "system.json"]) {
  if (!tag) throw new Error("Usage: node tools/release-manifest.mjs <tag> [system.json]");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, `${JSON.stringify(buildReleaseManifest(manifest, tag), null, 2)}\n`);
  process.stdout.write(`${file}: version ${versionFromTag(tag)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
