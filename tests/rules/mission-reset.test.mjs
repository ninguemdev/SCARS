import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { usesAfterMissionReset } from "../../module/rules/mission-reset.mjs";

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
});
