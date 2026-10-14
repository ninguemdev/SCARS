/**
 * The uses an ability gets back when a new mission starts, or null when it keeps its current value.
 * Only limited abilities marked to restore on a new mission recover, up to their maximum.
 */
export function usesAfterMissionReset({ uses, resetsOnMission }) {
  if (!resetsOnMission || uses.unlimited) return null;
  if (uses.value >= uses.max) return null;
  return uses.max;
}
