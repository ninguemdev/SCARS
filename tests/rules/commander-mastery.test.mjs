import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  addMasteryTarget,
  canOfferCommanderReroll,
  hasReceivedMastery
} from "../../module/rules/commander-mastery.mjs";

describe("commander-mastery", () => {
  describe("canOfferCommanderReroll", () => {
    it("offers the reroll on a failed or critically failed attribute test", () => {
      assert.equal(canOfferCommanderReroll({ test: { outcome: "failure" } }), true);
      assert.equal(canOfferCommanderReroll({ test: { outcome: "criticalFailure" } }), true);
    });

    it("does not offer it on a success", () => {
      assert.equal(canOfferCommanderReroll({ test: { outcome: "success" } }), false);
      assert.equal(canOfferCommanderReroll({ test: { outcome: "criticalSuccess" } }), false);
    });

    it("does not offer it on a horror test", () => {
      assert.equal(canOfferCommanderReroll({ test: { outcome: "failure" }, horror: { sanityLoss: 2 } }), false);
    });

    it("does not offer it on a message without a test", () => {
      assert.equal(canOfferCommanderReroll({ effect: { type: "damage" } }), false);
      assert.equal(canOfferCommanderReroll(undefined), false);
    });
  });

  describe("targets", () => {
    it("records a person once", () => {
      const once = addMasteryTarget([], "Actor.ally");
      assert.deepEqual(once, ["Actor.ally"]);
      assert.deepEqual(addMasteryTarget(once, "Actor.ally"), ["Actor.ally"]);
    });

    it("tells who already received the mastery", () => {
      assert.equal(hasReceivedMastery(["Actor.ally"], "Actor.ally"), true);
      assert.equal(hasReceivedMastery(["Actor.ally"], "Actor.other"), false);
    });
  });
});
