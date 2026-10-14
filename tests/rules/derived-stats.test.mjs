import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  clampResource,
  isDying,
  isShaken,
  maxHitPoints,
  maxSanity,
  shakenThreshold
} from "../../module/rules/derived-stats.mjs";

describe("derived-stats", () => {
  it("sets max HP to 10 plus Body", () => {
    assert.equal(maxHitPoints(0), 10);
    assert.equal(maxHitPoints(3), 13);
  });

  it("sets max Sanity to 10 plus Nerve", () => {
    assert.equal(maxSanity(0), 10);
    assert.equal(maxSanity(2), 12);
  });

  it("keeps HP and Sanity between 0 and the maximum", () => {
    assert.equal(clampResource(-4, 12), 0);
    assert.equal(clampResource(0, 12), 0);
    assert.equal(clampResource(7, 12), 7);
    assert.equal(clampResource(12, 12), 12);
    assert.equal(clampResource(15, 12), 12);
  });

  it("rounds half of the max Sanity down", () => {
    assert.equal(shakenThreshold(10), 5);
    assert.equal(shakenThreshold(11), 5);
    assert.equal(shakenThreshold(13), 6);
  });

  it("marks Shaken at half Sanity or less", () => {
    assert.equal(isShaken(7, 13), false);
    assert.equal(isShaken(6, 13), true);
    assert.equal(isShaken(6, 11), false);
    assert.equal(isShaken(5, 11), true);
    assert.equal(isShaken(0, 10), true);
  });

  it("marks Dying only at 0 HP", () => {
    assert.equal(isDying(1), false);
    assert.equal(isDying(0), true);
  });
});
