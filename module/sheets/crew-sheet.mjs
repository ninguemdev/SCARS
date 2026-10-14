import { ATTRIBUTES, ATTRIBUTE_RANGE } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class CrewSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["scars", "crew-sheet"],
    position: { width: 560, height: 620 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    main: {
      template: "systems/scars/templates/actor/crew-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;
    return Object.assign(context, {
      actor: this.actor,
      system,
      attributeRange: ATTRIBUTE_RANGE,
      attributes: Object.entries(ATTRIBUTES).map(([key, label]) => ({
        key,
        label,
        value: system.attributes[key]
      }))
    });
  }
}
