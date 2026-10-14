import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { isValidAttributeSpread } from "../../module/rules/attribute-spread.mjs";

describe("attribute-spread", () => {
  it("accepts +3, +2, +1 and 0 in any order", () => {
    assert.equal(isValidAttributeSpread({ body: 3, reflexes: 2, mind: 1, nerve: 0 }), true);
    assert.equal(isValidAttributeSpread({ body: 0, reflexes: 1, mind: 3, nerve: 2 }), true);
  });

  it("rejects a repeated value", () => {
    assert.equal(isValidAttributeSpread({ body: 3, reflexes: 3, mind: 1, nerve: 0 }), false);
  });

  it("rejects a spread with a different total distribution", () => {
    assert.equal(isValidAttributeSpread({ body: 2, reflexes: 2, mind: 1, nerve: 1 }), false);
  });

  it("rejects a missing attribute", () => {
    assert.equal(isValidAttributeSpread({ body: 3, reflexes: 2, mind: 1 }), false);
  });
});
