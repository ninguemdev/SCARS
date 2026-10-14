import { THREAT_DEFEAT } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class ThreatSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["scars", "threat-sheet"],
    position: { width: 480, height: 560 },
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
      defeatedBySuccesses: actor.system.defeat === "successes",
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
