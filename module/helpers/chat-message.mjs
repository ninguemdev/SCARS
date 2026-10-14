import { SYSTEM_ID } from "../config.mjs";

/** Posts a system card with the visibility chosen in the chat; the flags go under the system scope. */
export function createSystemMessage(actor, { content, rolls = [], flags }) {
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
