import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { describeSanityDrop } from "../../module/rules/sanity-change.mjs";

describe("sanity-change", () => {
  it("detects the drop to half Sanity or less", () => {
    assert.deepEqual(describeSanityDrop({ value: 7, max: 12 }, { value: 6, max: 12 }), {
      becameShaken: true,
      reachedZero: false
    });
  });

  it("does not repeat Shaken for a character who already was", () => {
    assert.equal(describeSanityDrop({ value: 5, max: 12 }, { value: 3, max: 12 }).becameShaken, false);
  });

  it("detects reaching 0, together with Shaken when it skips the half", () => {
    assert.deepEqual(describeSanityDrop({ value: 8, max: 12 }, { value: 0, max: 12 }), {
      becameShaken: true,
      reachedZero: true
    });
  });

  it("does not repeat 0 for a character who already was there", () => {
    assert.equal(describeSanityDrop({ value: 0, max: 12 }, { value: 0, max: 12 }).reachedZero, false);
  });

  it("detects Shaken caused by a higher maximum with the same current value", () => {
    assert.equal(describeSanityDrop({ value: 6, max: 11 }, { value: 6, max: 12 }).becameShaken, true);
  });

  it("ignores gains", () => {
    assert.deepEqual(describeSanityDrop({ value: 4, max: 12 }, { value: 9, max: 12 }), {
      becameShaken: false,
      reachedZero: false
    });
  });
});
