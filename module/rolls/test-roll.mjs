import { ATTRIBUTES, SYSTEM_ID } from "../config.mjs";
import { buildTestFormula } from "../rules/test-formula.mjs";
import { resolveTestOutcome, TEST_OUTCOMES } from "../rules/test-outcome.mjs";

export const TEST_CARD_TEMPLATE = "systems/scars/templates/chat/test-card.hbs";

/** Extra text shown on the card for outcomes decided by the natural result. */
const OUTCOME_NOTES = Object.freeze({
  [TEST_OUTCOMES.criticalSuccess]: "SCARS.Roll.Note.criticalSuccess",
  [TEST_OUTCOMES.criticalFailure]: "SCARS.Roll.Note.criticalFailure"
});

/**
 * Rolls an attribute test and posts the result card to the chat.
 * The outcome is stored in the message flags for the Ship Clock and rerolls.
 */
export async function rollAttributeTest(actor, attributeKey, options) {
  const test = await evaluateTest(actor, attributeKey, options);
  const content = await foundry.applications.handlebars.renderTemplate(
    TEST_CARD_TEMPLATE,
    buildTestCardData(actor, test)
  );
  return createTestMessage(actor, { content, rolls: [test.roll], flags: { test: buildTestFlags(test) } });
}

/** Rolls the d20 test and resolves its outcome, without posting anything. */
export async function evaluateTest(actor, attributeKey, { difficulty, advantage }) {
  const formula = buildTestFormula(actor.system.attributes[attributeKey], { advantage });
  const roll = await new Roll(formula).evaluate();
  const natural = roll.dice[0].total;
  return {
    attributeKey,
    difficulty,
    advantage,
    roll,
    natural,
    ...resolveTestOutcome({ total: roll.total, difficulty, natural })
  };
}

/** Template data for the test part of a chat card. */
export function buildTestCardData(actor, test) {
  return {
    title: game.i18n.format("SCARS.Roll.testTitle", {
      attribute: game.i18n.localize(ATTRIBUTES[test.attributeKey]),
      name: actor.name
    }),
    formula: test.roll.formula,
    dice: test.roll.dice[0].results.map((die) => ({ value: die.result, kept: die.active })),
    total: test.roll.total,
    natural: test.natural,
    difficulty: test.difficulty,
    advantage: test.advantage,
    outcome: test.outcome,
    outcomeLabel: `SCARS.Roll.Outcome.${test.outcome}`,
    outcomeNote: OUTCOME_NOTES[test.outcome] ?? null
  };
}

export function buildTestFlags(test) {
  return {
    attribute: test.attributeKey,
    difficulty: test.difficulty,
    advantage: test.advantage,
    natural: test.natural,
    total: test.roll.total,
    outcome: test.outcome,
    advancesShipClock: test.advancesShipClock
  };
}

/** Posts a test card with the visibility chosen in the chat. */
export function createTestMessage(actor, { content, rolls, flags }) {
  return ChatMessage.implementation.create(
    {
      speaker: ChatMessage.implementation.getSpeaker({ actor }),
      content,
      rolls,
      flags: { [SYSTEM_ID]: flags }
    },
    { messageMode: game.settings.get("core", "messageMode") }
  );
}
