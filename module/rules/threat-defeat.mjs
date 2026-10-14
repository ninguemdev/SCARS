/**
 * A threat is defeated at 0 HP or, when it is beaten by accumulated successes, once they reach the maximum.
 */
export function isThreatDefeated({ defeat, hp, successes }) {
  if (defeat === "successes") return successes.value >= successes.max;
  return hp.value <= 0;
}
