import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildReleaseManifest, versionFromTag } from "../../tools/release-manifest.mjs";

const manifest = {
  id: "scars",
  version: "0.1.0",
  url: "https://github.com/ninguemdev/SCARS",
  manifest: "old",
  download: "old"
};

describe("release-manifest", () => {
  it("reads the version from the tag, with or without the v", () => {
    assert.equal(versionFromTag("v0.2.0"), "0.2.0");
    assert.equal(versionFromTag("1.0.0"), "1.0.0");
    assert.equal(versionFromTag("v1.0.0-beta.1"), "1.0.0-beta.1");
  });

  it("rejects a tag that is not a version", () => {
    assert.throws(() => versionFromTag("release-final"));
    assert.throws(() => versionFromTag("v1.2"));
  });

  it("points the manifest at the latest release and the download at this release", () => {
    const released = buildReleaseManifest(manifest, "v0.2.0");
    assert.equal(released.version, "0.2.0");
    assert.equal(released.manifest, "https://github.com/ninguemdev/SCARS/releases/latest/download/system.json");
    assert.equal(released.download, "https://github.com/ninguemdev/SCARS/releases/download/v0.2.0/scars.zip");
    assert.equal(released.id, "scars");
  });
});
