import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { isThreatDefeated } from "../../module/rules/threat-defeat.mjs";

const healthy = { value: 8, max: 8 };
const noSuccesses = { value: 0, max: 3 };

describe("threat-defeat", () => {
  it("defeats a HP threat only at 0 HP", () => {
    assert.equal(isThreatDefeated({ defeat: "hp", hp: { value: 1, max: 8 }, successes: noSuccesses }), false);
    assert.equal(isThreatDefeated({ defeat: "hp", hp: { value: 0, max: 8 }, successes: noSuccesses }), true);
  });

  it("defeats a successes threat when the successes reach the maximum", () => {
    assert.equal(isThreatDefeated({ defeat: "successes", hp: healthy, successes: { value: 2, max: 3 } }), false);
    assert.equal(isThreatDefeated({ defeat: "successes", hp: healthy, successes: { value: 3, max: 3 } }), true);
  });

  it("ignores the resource that does not decide the defeat", () => {
    assert.equal(isThreatDefeated({ defeat: "successes", hp: { value: 0, max: 8 }, successes: noSuccesses }), false);
    assert.equal(isThreatDefeated({ defeat: "hp", hp: healthy, successes: { value: 3, max: 3 } }), false);
  });
});
