import { ATTRIBUTES } from "../config.mjs";
import { difficultyFromOption } from "../rules/difficulty.mjs";

/**
 * Public API in `game.scars.api`, for macros and other modules.
 * Each function warns the user and resolves to null when it cannot run, instead of throwing inside a macro.
 */
export const api = Object.freeze({ rollTest, rollHorror, useItem, startNewMission });

/**
 * Attribute test of a crew member. Without `difficulty`, the dialog asks for it.
 * `difficulty` is a preset key ("easy", "hard"…) or a positive integer.
 */
async function rollTest(actorUuid, attribute, { difficulty, advantage = false } = {}) {
  if (!(attribute in ATTRIBUTES)) {
    ui.notifications.warn(game.i18n.format("SCARS.Notify.unknownAttribute", { attribute }));
    return null;
  }
  const actor = await resolveOwnedDocument(actorUuid, { documentName: "Actor", types: ["crew"] });
  const resolved = resolveDifficultyOption(difficulty);
  if (!actor || resolved === null) return null;
  return actor.rollTest(attribute, { difficulty: resolved, advantage });
}

/** Horror test of a crew member. Without `difficulty`, the dialog asks for it. */
async function rollHorror(actorUuid, { difficulty, advantage = false, heavyScene = false } = {}) {
  const actor = await resolveOwnedDocument(actorUuid, { documentName: "Actor", types: ["crew"] });
  const resolved = resolveDifficultyOption(difficulty);
  if (!actor || resolved === null) return null;
  return actor.rollHorror({ difficulty: resolved, advantage, heavyScene });
}

/** Uses an ability or gear, as the "Usar" button of the sheet. */
async function useItem(itemUuid) {
  const item = await resolveOwnedDocument(itemUuid, { documentName: "Item", types: ["ability", "gear"] });
  if (!item) return null;
  return item.use();
}

/**
 * GM command "Nova missão": restores the abilities marked to restore on a new mission for every crew member,
 * including crew tokens not linked to an actor. Resolves to how many crew members and abilities were affected.
 */
async function startNewMission() {
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("SCARS.Notify.gameMasterOnly"));
    return null;
  }
  const crew = collectCrewActors();
  let abilities = 0;
  for (const actor of crew) abilities += await actor.restoreMissionUses();
  ui.notifications.info(game.i18n.format("SCARS.Notify.newMissionStarted", { abilities }));
  return { crew: crew.length, abilities };
}

function collectCrewActors() {
  const worldCrew = game.actors.filter((actor) => actor.type === "crew");
  const unlinkedCrew = game.scenes.contents.flatMap((scene) => scene.tokens
    .filter((token) => !token.actorLink && token.actor?.type === "crew")
    .map((token) => token.actor));
  return [...worldCrew, ...unlinkedCrew];
}

async function resolveOwnedDocument(uuid, { documentName, types }) {
  const document = await foundry.utils.fromUuid(uuid);
  if (document?.documentName !== documentName || !types.includes(document.type)) {
    ui.notifications.warn(game.i18n.format("SCARS.Notify.documentNotFound", { uuid }));
    return null;
  }
  if (!document.isOwner) {
    ui.notifications.warn(game.i18n.format("SCARS.Notify.cannotChangeActor", { name: document.name }));
    return null;
  }
  return document;
}

function resolveDifficultyOption(option) {
  const difficulty = difficultyFromOption(option);
  if (difficulty === null) ui.notifications.warn(game.i18n.localize("SCARS.Notify.invalidDifficultyOption"));
  return difficulty;
}
