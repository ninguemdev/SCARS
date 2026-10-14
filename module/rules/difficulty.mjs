import { DIFFICULTIES } from "../config.mjs";

/** Dialog choice that uses the custom value typed by the player instead of a preset. */
export const CUSTOM_DIFFICULTY = "custom";

/** The difficulty of a test, or null when the choice is unknown or the custom value is not a positive integer. */
export function resolveDifficulty(choice, customValue) {
  if (choice === CUSTOM_DIFFICULTY) {
    return Number.isInteger(customValue) && customValue > 0 ? customValue : null;
  }
  return DIFFICULTIES[choice]?.value ?? null;
}
