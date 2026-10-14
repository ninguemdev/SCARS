import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildSegments, fillPercent, MAX_SEGMENTS } from "../../module/helpers/segments.mjs";

describe("segments", () => {
  it("draws one segment per point of the maximum, filled up to the value", () => {
    assert.deepEqual(buildSegments(2, 4).map((segment) => segment.filled), [true, true, false, false]);
  });

  it("draws nothing for a zero, invalid or too large maximum", () => {
    assert.deepEqual(buildSegments(0, 0), []);
    assert.deepEqual(buildSegments(1, 2.5), []);
    assert.deepEqual(buildSegments(5, MAX_SEGMENTS + 1), []);
  });

  it("gives the share of the maximum between 0 and 100", () => {
    assert.equal(fillPercent(5, 10), 50);
    assert.equal(fillPercent(0, 10), 0);
    assert.equal(fillPercent(12, 10), 100);
    assert.equal(fillPercent(3, 0), 0);
  });
});
