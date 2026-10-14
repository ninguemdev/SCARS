import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildTestFormula } from "../../module/rules/test-formula.mjs";

describe("test-formula", () => {
  it("rolls one d20 plus the attribute", () => {
    assert.equal(buildTestFormula(2), "1d20 + 2");
    assert.equal(buildTestFormula(0), "1d20 + 0");
  });

  it("rolls two d20 and keeps the highest with advantage", () => {
    assert.equal(buildTestFormula(3, { advantage: true }), "2d20kh + 3");
  });

  it("rolls normally when advantage is not granted", () => {
    assert.equal(buildTestFormula(1, { advantage: false }), "1d20 + 1");
  });

  it("subtracts a negative modifier", () => {
    assert.equal(buildTestFormula(-1), "1d20 - 1");
  });
});
