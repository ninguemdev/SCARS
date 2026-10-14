/** Formula types of a gear item that roll an effect when the item is used. */
export const EFFECT_TYPES = Object.freeze({
  damage: "damage",
  healing: "healing"
});

/** An item without limited uses can always be used; a limited one needs at least one use left. */
export function hasUsesLeft(uses) {
  if (!uses?.limited) return true;
  return uses.value > 0;
}

/**
 * The effect a gear item rolls when used, or null when it only registers the use.
 * A damage or healing type without a formula has nothing to roll.
 */
export function resolveEffectType({ formulaType, formula }) {
  if (!Object.values(EFFECT_TYPES).includes(formulaType)) return null;
  if (!formula?.trim()) return null;
  return formulaType;
}
