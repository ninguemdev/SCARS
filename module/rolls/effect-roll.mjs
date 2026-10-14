import { GEAR_FORMULA_TYPES } from "../config.mjs";

/** Rolls a damage or healing formula. Formulas may reference the roll data of the item and its actor. */
export async function rollEffect({ formula, type, rollData = {} }) {
  const roll = await new Roll(formula, rollData).evaluate();
  return { roll, type, formula: roll.formula, total: roll.total };
}

/** Template data for the effect part of a chat card. */
export function buildEffectCardData(effect) {
  return {
    type: effect.type,
    label: GEAR_FORMULA_TYPES[effect.type],
    formula: effect.formula,
    total: effect.total
  };
}

/** Stored in the message flags so the card buttons can apply the total later. */
export function buildEffectFlags(effect) {
  return { type: effect.type, formula: effect.formula, total: effect.total };
}
