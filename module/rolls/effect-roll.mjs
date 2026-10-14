import { GEAR_FORMULA_TYPES } from "../config.mjs";
import { createSystemMessage } from "../helpers/chat-message.mjs";

/** Card for using an item or rolling an effect; the effect part has the button that applies it. */
export const ITEM_CARD_TEMPLATE = "systems/scars/templates/chat/item-card.hbs";

/**
 * Formulas are typed freely on the sheets, so an invalid one is reported to the user instead of failing the roll.
 * The source name tells which sheet to fix.
 */
export function isValidEffectFormula(formula, sourceName) {
  if (Roll.validate(formula)) return true;
  ui.notifications.error(game.i18n.format("SCARS.Notify.invalidFormula", { name: sourceName, formula }));
  return false;
}

/** Rolls a damage or healing formula. Formulas may reference the roll data of the item or actor. */
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

/** Stored in the message flags so the card button can apply the total. */
export function buildEffectFlags(effect) {
  return { type: effect.type, formula: effect.formula, total: effect.total };
}

/** Posts a card with only an effect, such as the damage of a threat. */
export async function postEffectCard(actor, { name, img, effect, flags = {} }) {
  const content = await foundry.applications.handlebars.renderTemplate(ITEM_CARD_TEMPLATE, {
    name,
    img,
    effect: buildEffectCardData(effect)
  });
  return createSystemMessage(actor, {
    content,
    rolls: [effect.roll],
    flags: { ...flags, effect: buildEffectFlags(effect) }
  });
}
