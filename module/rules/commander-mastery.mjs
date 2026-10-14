import { TEST_OUTCOMES } from "./test-outcome.mjs";

const FAILED_OUTCOMES = Object.freeze([TEST_OUTCOMES.failure, TEST_OUTCOMES.criticalFailure]);

/**
 * The commander's mastery rerolls a failed attribute test. A horror test is left out: its Sanity loss is already
 * applied to the ally, and a reroll cannot take it back.
 */
export function canOfferCommanderReroll({ test, horror } = {}) {
  if (!test || horror) return false;
  return FAILED_OUTCOMES.includes(test.outcome);
}

/** Each person receives the mastery once per mission; the commander counts as a person too. */
export function hasReceivedMastery(targets, actorUuid) {
  return targets.includes(actorUuid);
}

/** The registry after a person receives the mastery. */
export function addMasteryTarget(targets, actorUuid) {
  if (hasReceivedMastery(targets, actorUuid)) return [...targets];
  return [...targets, actorUuid];
}
