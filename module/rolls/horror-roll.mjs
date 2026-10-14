import { HORROR_LOSS } from "../config.mjs";
import { createSystemMessage } from "../helpers/chat-message.mjs";
import { clampResource } from "../rules/derived-stats.mjs";
import {
  buildTestCardData,
  buildTestFlags,
  evaluateTest,
  TEST_CARD_TEMPLATE
} from "./test-roll.mjs";

/** The horror test is a Nerve test. */
export const HORROR_ATTRIBUTE = "nerve";

/**
 * Rolls a horror test. On a failure, rolls the Sanity loss (heavier in a heavy scene), posts the card and then
 * applies the loss, so the GM alerts for Shaken and Sanity 0 come after the card.
 */
export async function rollHorrorTest(actor, { difficulty, advantage, heavyScene }) {
  const test = await evaluateTest(actor, HORROR_ATTRIBUTE, { difficulty, advantage });
  const loss = test.isSuccess ? null : await rollSanityLoss(actor, heavyScene);

  const content = await foundry.applications.handlebars.renderTemplate(TEST_CARD_TEMPLATE, {
    ...buildTestCardData(actor, test),
    title: game.i18n.format("SCARS.Roll.horrorTitle", { name: actor.name }),
    horror: { heavyScene, keptControl: test.isSuccess, loss }
  });
  const message = await createSystemMessage(actor, {
    content,
    rolls: loss ? [test.roll, loss.roll] : [test.roll],
    flags: {
      test: buildTestFlags(test),
      horror: { heavyScene, sanityLoss: loss?.amount ?? 0 }
    }
  });

  if (loss) await actor.update({ "system.sanity.value": loss.after });
  return message;
}

async function rollSanityLoss(actor, heavyScene) {
  const formula = heavyScene ? HORROR_LOSS.heavy : HORROR_LOSS.normal;
  const roll = await new Roll(formula).evaluate();
  const { value: before, max } = actor.system.sanity;
  return { roll, formula, amount: roll.total, before, after: clampResource(before - roll.total, max), max };
}
