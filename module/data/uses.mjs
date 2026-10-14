import { clampResource } from "../rules/derived-stats.mjs";

/**
 * Keeps an incoming uses value between 0 and the maximum that results from the same update.
 * Called from the _preUpdate of item models that track uses.
 */
export function clampUsesChange(changes, source) {
  const usesChanges = changes.system?.uses;
  if (usesChanges?.value === undefined) return;
  const max = usesChanges.max ?? source.uses.max;
  usesChanges.value = clampResource(usesChanges.value, max);
}
