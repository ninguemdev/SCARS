/**
 * The uses an ability gets back when a new mission starts, or null when it keeps its current value.
 * Only limited abilities marked to restore on a new mission recover, up to their maximum.
 */
export function usesAfterMissionReset({ uses, resetsOnMission }) {
  if (!resetsOnMission || uses.unlimited || uses.oncePerTarget) return null;
  if (uses.value >= uses.max) return null;
  return uses.max;
}

/**
 * The registry of a once-per-person ability after a new mission starts, or null when there is nothing to clear.
 * Everyone can receive the commander's mastery again in the new mission.
 */
export function targetsAfterMissionReset({ uses }) {
  if (!uses.oncePerTarget || !uses.targets?.length) return null;
  return [];
}
