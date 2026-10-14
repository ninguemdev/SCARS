import { clampResource } from "./derived-stats.mjs";
import { EFFECT_TYPES } from "./item-use.mjs";

/** HP after a damage or healing effect, kept between 0 and the maximum. */
export function hitPointsAfterEffect({ value, max }, { type, total }) {
  if (!Object.values(EFFECT_TYPES).includes(type)) throw new Error(`Unknown effect type "${type}"`);
  const change = type === EFFECT_TYPES.healing ? total : -total;
  return clampResource(value + change, max);
}
