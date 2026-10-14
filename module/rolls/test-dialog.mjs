import { DIFFICULTIES } from "../config.mjs";
import { CUSTOM_DIFFICULTY, resolveDifficulty } from "../rules/difficulty.mjs";

const TEMPLATE = "systems/scars/templates/dialog/test-dialog.hbs";

/**
 * Asks for the difficulty and whether the test has advantage; a horror test also asks whether the scene is heavy.
 * Resolves to `{ difficulty, advantage, heavyScene }`, or null when the dialog is closed or the custom difficulty
 * is invalid.
 */
export async function promptTestOptions({ title, horror = false }) {
  const { renderTemplate } = foundry.applications.handlebars;
  const content = await renderTemplate(TEMPLATE, {
    difficultyOptions: buildDifficultyOptions(),
    selectedDifficulty: "normal",
    horror
  });
  const answer = await foundry.applications.api.DialogV2.input({
    window: { title, icon: "fa-solid fa-dice-d20" },
    classes: ["scars", "test-dialog"],
    content,
    ok: { label: "SCARS.Roll.roll", icon: "fa-solid fa-dice-d20" }
  });
  if (!answer) return null;
  const difficulty = resolveDifficulty(answer.difficulty, answer.customDifficulty);
  if (difficulty === null) {
    ui.notifications.warn("SCARS.Roll.invalidDifficulty", { localize: true });
    return null;
  }
  return { difficulty, advantage: Boolean(answer.advantage), heavyScene: Boolean(answer.heavyScene) };
}

function buildDifficultyOptions() {
  const options = {};
  for (const [key, { value, label }] of Object.entries(DIFFICULTIES)) {
    options[key] = `${game.i18n.localize(label)} (${value})`;
  }
  options[CUSTOM_DIFFICULTY] = game.i18n.localize("SCARS.Difficulty.custom");
  return options;
}
