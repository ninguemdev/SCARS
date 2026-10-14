import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { targetsAfterMissionReset, usesAfterMissionReset } from "../../module/rules/mission-reset.mjs";

describe("mission-reset", () => {
  it("restores a spent mastery to its maximum", () => {
    const mastery = { uses: { value: 0, max: 3, unlimited: false }, resetsOnMission: true };
    assert.equal(usesAfterMissionReset(mastery), 3);
  });

  it("keeps an ability that does not restore on a new mission", () => {
    const ability = { uses: { value: 0, max: 3, unlimited: false }, resetsOnMission: false };
    assert.equal(usesAfterMissionReset(ability), null);
  });

  it("keeps an unlimited ability", () => {
    const ability = { uses: { value: 0, max: 3, unlimited: true }, resetsOnMission: true };
    assert.equal(usesAfterMissionReset(ability), null);
  });

  it("keeps an ability that already has all its uses", () => {
    const ability = { uses: { value: 3, max: 3, unlimited: false }, resetsOnMission: true };
    assert.equal(usesAfterMissionReset(ability), null);
  });

  it("does not count uses of a once-per-person ability", () => {
    const mastery = { uses: { value: 0, max: 3, unlimited: false, oncePerTarget: true, targets: [] }, resetsOnMission: true };
    assert.equal(usesAfterMissionReset(mastery), null);
  });

  it("clears who received a once-per-person ability", () => {
    const mastery = { uses: { oncePerTarget: true, targets: ["Actor.ally"] } };
    assert.deepEqual(targetsAfterMissionReset(mastery), []);
  });

  it("leaves the registry alone when it is empty or the ability is not once per person", () => {
    assert.equal(targetsAfterMissionReset({ uses: { oncePerTarget: true, targets: [] } }), null);
    assert.equal(targetsAfterMissionReset({ uses: { oncePerTarget: false, targets: ["Actor.ally"] } }), null);
  });
});
