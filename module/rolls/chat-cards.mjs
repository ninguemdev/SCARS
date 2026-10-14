import { SYSTEM_ID } from "../config.mjs";
import { findCommanderMasteries, rerollWithCommanderMastery } from "./commander-reroll.mjs";

const APPLY_EFFECT_SELECTOR = "[data-scars-apply-effect]";
const COMMANDER_REROLL_SELECTOR = "[data-scars-commander-reroll]";

/**
 * Hook for renderChatMessageHTML. The chat log is a core application, so the system cannot add its own
 * ApplicationV2 actions there; the card buttons get native listeners each time the message is rendered.
 */
export function activateChatCardListeners(message, html) {
  activateApplyEffect(message, html);
  activateCommanderReroll(message, html);
}

function activateApplyEffect(message, html) {
  const effect = message.getFlag(SYSTEM_ID, "effect");
  const button = html.querySelector(APPLY_EFFECT_SELECTOR);
  if (!effect || !button) return;
  button.addEventListener("click", () => applyEffectToControlledTokens(effect));
}

/** Only users who own a crew member with the commander's mastery see the reroll button. */
function activateCommanderReroll(message, html) {
  const button = html.querySelector(COMMANDER_REROLL_SELECTOR);
  if (!button) return;
  if (!findCommanderMasteries().length) {
    button.remove();
    return;
  }
  button.addEventListener("click", () => rerollWithCommanderMastery(message));
}

/**
 * Applies a damage or healing total to the actors of the controlled tokens.
 * A linked actor with several tokens on the scene receives it once.
 */
export async function applyEffectToControlledTokens(effect) {
  const actors = new Set(canvas.tokens?.controlled.map((token) => token.actor).filter(Boolean) ?? []);
  if (!actors.size) {
    ui.notifications.warn(game.i18n.localize("SCARS.Notify.noTokenSelected"));
    return;
  }
  for (const actor of actors) await applyEffectToActor(actor, effect);
}

async function applyEffectToActor(actor, effect) {
  if (!actor.isOwner) {
    ui.notifications.warn(game.i18n.format("SCARS.Notify.cannotChangeActor", { name: actor.name }));
    return;
  }
  const { before, after, max } = await actor.applyEffect(effect);
  ui.notifications.info(game.i18n.format("SCARS.Notify.effectApplied", { name: actor.name, before, after, max }));
}
