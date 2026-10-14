import { TEST_DIE } from "../config.mjs";

export const TEST_OUTCOMES = Object.freeze({
  criticalSuccess: "criticalSuccess",
  success: "success",
  failure: "failure",
  criticalFailure: "criticalFailure"
});

/**
 * Resolves a test from the total, the difficulty and the natural result of the kept d20.
 * A natural 20 or 1 decides the test regardless of the total.
 */
export function resolveTestOutcome({ total, difficulty, natural }) {
  if (natural === TEST_DIE.criticalSuccess) return buildResult(TEST_OUTCOMES.criticalSuccess);
  if (natural === TEST_DIE.criticalFailure) return buildResult(TEST_OUTCOMES.criticalFailure);
  if (total >= difficulty) return buildResult(TEST_OUTCOMES.success);
  return buildResult(TEST_OUTCOMES.failure);
}

function buildResult(outcome) {
  const isSuccess = outcome === TEST_OUTCOMES.criticalSuccess || outcome === TEST_OUTCOMES.success;
  return {
    outcome,
    isSuccess,
    advancesShipClock: outcome === TEST_OUTCOMES.criticalFailure
  };
}
