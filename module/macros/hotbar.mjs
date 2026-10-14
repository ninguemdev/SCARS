import { ATTRIBUTES, SYSTEM_ID, TEST_DRAG_TYPE } from "../config.mjs";

/**
 * Hook for hotbarDrop. An attribute test or a usable item becomes a script macro that calls the public API;
 * anything else keeps the default behavior. Hooks answer synchronously, so the macro is created afterwards.
 */
export function onHotbarDrop(hotbar, data, slot) {
  const definition = buildMacroDefinition(data);
  if (!definition) return;
  assignMacro(definition, slot);
  return false;
}

function buildMacroDefinition(data) {
  if (data.type === TEST_DRAG_TYPE) return buildTestMacro(data);
  if (data.type === "Item") return buildItemMacro(data);
  return null;
}

function buildTestMacro({ actorUuid, attribute }) {
  const actor = foundry.utils.fromUuidSync(actorUuid);
  if (!actor || !(attribute in ATTRIBUTES)) return null;
  return {
    name: game.i18n.format("SCARS.Roll.testTitle", {
      attribute: game.i18n.localize(ATTRIBUTES[attribute]),
      name: actor.name
    }),
    img: actor.img,
    command: `game.scars.api.rollTest(${JSON.stringify(actorUuid)}, ${JSON.stringify(attribute)});`
  };
}

/** Only abilities and gear are used from the hotbar; other items keep the default macro that opens the sheet. */
function buildItemMacro({ uuid }) {
  const item = foundry.utils.fromUuidSync(uuid);
  if (!item?.isUsable) return null;
  return {
    name: item.name,
    img: item.img,
    command: `game.scars.api.useItem(${JSON.stringify(uuid)});`
  };
}

/** Reuses a macro the user already has for the same command, so dragging again does not create duplicates. */
async function assignMacro({ name, img, command }, slot) {
  const existing = game.macros.find((macro) => macro.isOwner && macro.command === command);
  const macro = existing ?? await foundry.documents.Macro.implementation.create({
    name,
    img,
    type: "script",
    command,
    flags: { [SYSTEM_ID]: { hotbar: true } }
  });
  await game.user.assignHotbarMacro(macro, slot);
}
