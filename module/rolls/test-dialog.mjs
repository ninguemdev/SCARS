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
  const content = await renderTemplate(TEMPLATE, { difficultyChoices: buildDifficultyChoices("normal"), horror });
  const answer = await foundry.applications.api.DialogV2.input({
    window: { title, icon: "fa-solid fa-dice-d20" },
    classes: ["scars", "test-dialog"],
    position: { width: 500 },
    content,
    ok: { label: "SCARS.Roll.roll", icon: "fa-solid fa-dice-d20" },
    render: (event, dialog) => selectCustomWhenTyped(dialog.element)
  });
  if (!answer) return null;
  const difficulty = resolveDifficulty(answer.difficulty, answer.customDifficulty);
  if (difficulty === null) {
    ui.notifications.warn("SCARS.Roll.invalidDifficulty", { localize: true });
    return null;
  }
  return { difficulty, advantage: Boolean(answer.advantage), heavyScene: Boolean(answer.heavyScene) };
}

/** Typing a custom difficulty selects the custom chip, so the typed value is the one used. */
function selectCustomWhenTyped(element) {
  const customInput = element.querySelector("[name=customDifficulty]");
  const customChip = element.querySelector(`[name=difficulty][value=${CUSTOM_DIFFICULTY}]`);
  customInput?.addEventListener("input", () => {
    if (customChip) customChip.checked = true;
  });
}

/** The presets as selectable chips, plus the custom choice that reads the typed value. */
function buildDifficultyChoices(selectedKey) {
  const presets = Object.entries(DIFFICULTIES).map(([key, { value, label }]) => ({
    key,
    value,
    label: game.i18n.localize(label),
    selected: key === selectedKey
  }));
  const custom = { key: CUSTOM_DIFFICULTY, value: null, label: game.i18n.localize("SCARS.Difficulty.custom"), selected: false };
  return [...presets, custom];
}
