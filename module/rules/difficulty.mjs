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

/**
 * The difficulty given to a roll from code, such as a macro: a preset key ("hard") or a positive integer.
 * Undefined means the dialog should ask; null means the option is invalid.
 */
export function difficultyFromOption(option) {
  if (option === undefined) return undefined;
  if (typeof option === "string") return resolveDifficulty(option);
  return resolveDifficulty(CUSTOM_DIFFICULTY, option);
}
