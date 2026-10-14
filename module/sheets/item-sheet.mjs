import { GEAR_FORMULA_TYPES } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

const TEMPLATE_ROOT = "systems/scars/templates/item";

/** Item types with their own part; every other part is shared by all types. */
const TYPE_PARTS = ["profession", "ability", "gear"];

export class ScarsItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["scars", "item-sheet"],
    position: { width: 520, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/header.hbs` },
    profession: { template: `${TEMPLATE_ROOT}/profession.hbs` },
    ability: { template: `${TEMPLATE_ROOT}/ability.hbs` },
    gear: { template: `${TEMPLATE_ROOT}/gear.hbs` },
    description: { template: `${TEMPLATE_ROOT}/description.hbs`, scrollable: [""] }
  };

  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    for (const type of TYPE_PARTS) {
      if (type !== this.item.type) delete parts[type];
    }
    return parts;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { item } = this;
    const { TextEditor } = foundry.applications.ux;
    return Object.assign(context, {
      item,
      system: item.system,
      typeLabel: `TYPES.Item.${item.type}`,
      formulaTypes: GEAR_FORMULA_TYPES,
      descriptionHTML: await TextEditor.implementation.enrichHTML(item.system.description, {
        secrets: item.isOwner,
        relativeTo: item
      })
    });
  }
}
