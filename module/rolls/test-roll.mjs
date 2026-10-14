import { ATTRIBUTES, SYSTEM_ID } from "../config.mjs";
import { buildTestFormula } from "../rules/test-formula.mjs";
import { resolveTestOutcome, TEST_OUTCOMES } from "../rules/test-outcome.mjs";

const CARD_TEMPLATE = "systems/scars/templates/chat/test-card.hbs";

/** Extra text shown on the card for outcomes decided by the natural result. */
const OUTCOME_NOTES = Object.freeze({
  [TEST_OUTCOMES.criticalSuccess]: "SCARS.Roll.Note.criticalSuccess",
  [TEST_OUTCOMES.criticalFailure]: "SCARS.Roll.Note.criticalFailure"
});

/**
 * Rolls an attribute test and posts the result card to the chat.
 * The outcome is stored in the message flags for the Ship Clock and rerolls.
 */
export async function rollAttributeTest(actor, attributeKey, { difficulty, advantage }) {
  const formula = buildTestFormula(actor.system.attributes[attributeKey], { advantage });
  const roll = await new Roll(formula).evaluate();
  const keptDie = roll.dice[0];
  const natural = keptDie.total;
  const result = resolveTestOutcome({ total: roll.total, difficulty, natural });

  const content = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, {
    title: game.i18n.format("SCARS.Roll.testTitle", {
      attribute: game.i18n.localize(ATTRIBUTES[attributeKey]),
      name: actor.name
    }),
    formula: roll.formula,
    dice: keptDie.results.map((die) => ({ value: die.result, kept: die.active })),
    total: roll.total,
    natural,
    difficulty,
    advantage,
    outcome: result.outcome,
    outcomeLabel: `SCARS.Roll.Outcome.${result.outcome}`,
    outcomeNote: OUTCOME_NOTES[result.outcome] ?? null
  });

  return ChatMessage.implementation.create(
    {
      speaker: ChatMessage.implementation.getSpeaker({ actor }),
      content,
      rolls: [roll],
      flags: {
        [SYSTEM_ID]: {
          test: {
            attribute: attributeKey,
            difficulty,
            advantage,
            natural,
            total: roll.total,
            outcome: result.outcome,
            advancesShipClock: result.advancesShipClock
          }
        }
      }
    },
    { messageMode: game.settings.get("core", "messageMode") }
  );
}
