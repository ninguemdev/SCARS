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

/**
 * Spends (negative delta) or recovers (positive delta) uses of an item that has limited uses.
 * Starts from the prepared value, already within the maximum; the _preUpdate keeps the result within limits.
 */
export async function changeUsesBy(model, delta) {
  if (!model.uses.limited) return;
  await model.parent.update({ "system.uses.value": model.uses.value + delta });
}
