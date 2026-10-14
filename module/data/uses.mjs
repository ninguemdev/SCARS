import { clampResource } from "../rules/derived-stats.mjs";

/**
 * Keeps an incoming `<key>.value` between 0 and the `<key>.max` that results from the same update.
 * Called from the _preUpdate of models whose tracked values have a stored maximum.
 */
export function clampValueChange(changes, source, key) {
  const keyChanges = changes.system?.[key];
  if (keyChanges?.value === undefined) return;
  const max = keyChanges.max ?? source[key].max;
  keyChanges.value = clampResource(keyChanges.value, max);
}

export function clampUsesChange(changes, source) {
  clampValueChange(changes, source, "uses");
}

/**
 * Spends (negative delta) or recovers (positive delta) uses of an item that has limited uses.
 * Starts from the prepared value, already within the maximum; the _preUpdate keeps the result within limits.
 */
export async function changeUsesBy(model, delta) {
  if (!model.uses.limited) return;
  await model.parent.update({ "system.uses.value": model.uses.value + delta });
}
