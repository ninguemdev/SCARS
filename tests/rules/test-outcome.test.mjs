import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { TEST_OUTCOMES, resolveTestOutcome } from "../../module/rules/test-outcome.mjs";

describe("test-outcome", () => {
  it("succeeds when the total equals the difficulty", () => {
    const result = resolveTestOutcome({ total: 15, difficulty: 15, natural: 12 });
    assert.equal(result.outcome, TEST_OUTCOMES.success);
    assert.equal(result.isSuccess, true);
  });

  it("fails when the total is below the difficulty", () => {
    const result = resolveTestOutcome({ total: 14, difficulty: 15, natural: 12 });
    assert.equal(result.outcome, TEST_OUTCOMES.failure);
    assert.equal(result.isSuccess, false);
  });

  it("succeeds on a natural 20 even with a low total", () => {
    const result = resolveTestOutcome({ total: 20, difficulty: 25, natural: 20 });
    assert.equal(result.outcome, TEST_OUTCOMES.criticalSuccess);
    assert.equal(result.isSuccess, true);
  });

  it("fails on a natural 1 even with a high total", () => {
    const result = resolveTestOutcome({ total: 4, difficulty: 3, natural: 1 });
    assert.equal(result.outcome, TEST_OUTCOMES.criticalFailure);
    assert.equal(result.isSuccess, false);
  });

  it("uses the kept die of an advantage roll as the natural", () => {
    const keptHighest = resolveTestOutcome({ total: 21, difficulty: 15, natural: 18 });
    assert.equal(keptHighest.outcome, TEST_OUTCOMES.success);
  });
});
