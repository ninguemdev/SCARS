import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { EFFECT_TYPES, hasUsesLeft, resolveEffectType } from "../../module/rules/item-use.mjs";

describe("item-use", () => {
  describe("hasUsesLeft", () => {
    it("allows a limited item with uses left", () => {
      assert.equal(hasUsesLeft({ limited: true, value: 1, max: 3 }), true);
    });

    it("blocks a limited item at 0 uses", () => {
      assert.equal(hasUsesLeft({ limited: true, value: 0, max: 3 }), false);
    });

    it("always allows an item without limited uses", () => {
      assert.equal(hasUsesLeft({ limited: false, value: 0, max: 0 }), true);
      assert.equal(hasUsesLeft(undefined), true);
    });
  });

  describe("resolveEffectType", () => {
    it("rolls damage and healing formulas", () => {
      assert.equal(resolveEffectType({ formulaType: "damage", formula: "1d10" }), EFFECT_TYPES.damage);
      assert.equal(resolveEffectType({ formulaType: "healing", formula: "1d6" }), EFFECT_TYPES.healing);
    });

    it("rolls nothing without a formula type", () => {
      assert.equal(resolveEffectType({ formulaType: "none", formula: "1d6" }), null);
    });

    it("rolls nothing when the formula is blank", () => {
      assert.equal(resolveEffectType({ formulaType: "damage", formula: "  " }), null);
      assert.equal(resolveEffectType({ formulaType: "healing", formula: "" }), null);
    });
  });
});
