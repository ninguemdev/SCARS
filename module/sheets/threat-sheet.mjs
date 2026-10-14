import { THREAT_DEFEAT } from "../config.mjs";
import { buildSegments } from "../helpers/segments.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class ThreatSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["scars", "threat-sheet"],
    position: { width: 560, height: 720 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      rollDamage: ThreatSheet.#onRollDamage
    }
  };

  static PARTS = {
    main: { template: "systems/scars/templates/actor/threat-sheet.hbs", scrollable: [""] }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { actor } = this;
    const { TextEditor } = foundry.applications.ux;
    return Object.assign(context, {
      actor,
      system: actor.system,
      defeatChoices: THREAT_DEFEAT,
      condition: buildCondition(actor.system),
      descriptionHTML: await TextEditor.implementation.enrichHTML(actor.system.description, {
        secrets: actor.isOwner,
        relativeTo: actor
      })
    });
  }

  static async #onRollDamage() {
    await this.actor.rollDamage();
  }
}

/** The resource that decides the defeat: HP counting down, or successes counting up to the maximum. */
function buildCondition(system) {
  const bySuccesses = system.defeat === "successes";
  const key = bySuccesses ? "successes" : "hp";
  const { value, max } = system[key];
  return {
    key,
    label: bySuccesses ? "SCARS.Sheet.successes" : "SCARS.Sheet.hitPoints",
    value,
    max,
    // The schema accepts 0 HP as a maximum, but at least one success is needed to defeat a threat.
    minMax: bySuccesses ? 1 : 0,
    segments: buildSegments(value, max)
  };
}
