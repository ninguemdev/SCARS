import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { hitPointsAfterEffect } from "../../module/rules/apply-effect.mjs";

const hitPoints = { value: 8, max: 12 };

describe("apply-effect", () => {
  it("subtracts damage", () => {
    assert.equal(hitPointsAfterEffect(hitPoints, { type: "damage", total: 3 }), 5);
  });

  it("does not go below 0 HP", () => {
    assert.equal(hitPointsAfterEffect(hitPoints, { type: "damage", total: 10 }), 0);
  });

  it("adds healing", () => {
    assert.equal(hitPointsAfterEffect(hitPoints, { type: "healing", total: 3 }), 11);
  });

  it("does not heal above the maximum", () => {
    assert.equal(hitPointsAfterEffect(hitPoints, { type: "healing", total: 6 }), 12);
  });

  it("rejects an unknown effect type", () => {
    assert.throws(() => hitPointsAfterEffect(hitPoints, { type: "none", total: 3 }));
  });
});
