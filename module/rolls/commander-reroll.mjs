import { SYSTEM_ID } from "../config.mjs";
import { addMasteryTarget, canOfferCommanderReroll, hasReceivedMastery } from "../rules/commander-mastery.mjs";
import { rollAttributeTest } from "./test-roll.mjs";

/**
 * The once-per-person masteries the current user can spend: abilities of the crew members they own, including
 * crew tokens on the scene that are not linked to an actor.
 */
export function findCommanderMasteries() {
  const ownedCrew = new Set(game.actors.filter((actor) => actor.type === "crew" && actor.isOwner));
  for (const token of canvas?.scene?.tokens ?? []) {
    if (!token.actorLink && token.actor?.type === "crew" && token.isOwner) ownedCrew.add(token.actor);
  }
  return [...ownedCrew].flatMap((actor) => actor.itemTypes.ability
    .filter((ability) => ability.system.uses.oncePerTarget)
    .map((ability) => ({ actor, ability })));
}

/**
 * Spends the commander's mastery on a failed attribute test: the person who failed rolls again with advantage.
 * Each person receives it once per mission. Resolves to the new chat message, or null when it cannot be used.
 */
export async function rerollWithCommanderMastery(message) {
  const flags = message.flags[SYSTEM_ID] ?? {};
  if (!canOfferCommanderReroll(flags)) return null;

  const ally = ChatMessage.implementation.getSpeakerActor(message.speaker);
  if (!ally?.system.attributes) {
    ui.notifications.warn(game.i18n.localize("SCARS.Notify.unknownTestActor"));
    return null;
  }

  const mastery = chooseCommanderMastery(findCommanderMasteries());
  if (!mastery) return null;
  const { actor: commander, ability } = mastery;
  const { targets } = ability.system.uses;
  if (hasReceivedMastery(targets, ally.uuid)) {
    ui.notifications.warn(game.i18n.format("SCARS.Notify.alreadyReceived", { name: ally.name, ability: ability.name }));
    return null;
  }

  await ability.update({ "system.uses.targets": addMasteryTarget(targets, ally.uuid) });
  const { attribute, difficulty } = flags.test;
  return rollAttributeTest(ally, attribute, { difficulty, advantage: true }, {
    reroll: { commander, ability, fromMessageId: message.id }
  });
}

/**
 * With a single commander there is nothing to choose. A user with several, usually the GM, picks one by selecting
 * its token or by having it as their character.
 */
function chooseCommanderMastery(masteries) {
  if (!masteries.length) {
    ui.notifications.warn(game.i18n.localize("SCARS.Notify.noCommanderMastery"));
    return null;
  }
  if (masteries.length === 1) return masteries[0];
  const selected = new Set(canvas?.tokens?.controlled.map((token) => token.actor) ?? []);
  const bySelection = masteries.filter(({ actor }) => selected.has(actor));
  if (bySelection.length === 1) return bySelection[0];
  const byCharacter = masteries.filter(({ actor }) => actor === game.user.character);
  if (bySelection.length === 0 && byCharacter.length === 1) return byCharacter[0];
  ui.notifications.warn(game.i18n.localize("SCARS.Notify.selectCommander"));
  return null;
}
