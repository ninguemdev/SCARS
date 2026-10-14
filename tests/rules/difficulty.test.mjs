import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { CUSTOM_DIFFICULTY, resolveDifficulty } from "../../module/rules/difficulty.mjs";

describe("difficulty", () => {
  it("uses the value of each preset", () => {
    assert.equal(resolveDifficulty("veryEasy"), 5);
    assert.equal(resolveDifficulty("easy"), 10);
    assert.equal(resolveDifficulty("normal"), 15);
    assert.equal(resolveDifficulty("hard"), 20);
  });

  it("uses the custom value when the custom option is chosen", () => {
    assert.equal(resolveDifficulty(CUSTOM_DIFFICULTY, 12), 12);
  });

  it("ignores the custom value for a preset", () => {
    assert.equal(resolveDifficulty("easy", 12), 10);
  });

  it("rejects a missing, zero, negative or fractional custom value", () => {
    assert.equal(resolveDifficulty(CUSTOM_DIFFICULTY, null), null);
    assert.equal(resolveDifficulty(CUSTOM_DIFFICULTY, 0), null);
    assert.equal(resolveDifficulty(CUSTOM_DIFFICULTY, -3), null);
    assert.equal(resolveDifficulty(CUSTOM_DIFFICULTY, 12.5), null);
  });

  it("rejects an unknown choice", () => {
    assert.equal(resolveDifficulty("impossible"), null);
  });
});
