import { ATTRIBUTES, ATTRIBUTE_RANGE, GEAR_FORMULA_TYPES, TEST_DRAG_TYPE } from "../config.mjs";
import { buildSegments, fillPercent } from "../helpers/segments.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

const TEMPLATE_ROOT = "systems/scars/templates/actor";
const ITEM_ROW_TEMPLATE = `${TEMPLATE_ROOT}/item-row.hbs`;

export class CrewSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["scars", "crew-sheet"],
    position: { width: 760, height: 780 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      rollTest: CrewSheet.#onRollTest,
      rollHorror: CrewSheet.#onRollHorror,
      useItem: CrewSheet.#onUseItem,
      editItem: CrewSheet.#onEditItem,
      deleteItem: CrewSheet.#onDeleteItem,
      changeUses: CrewSheet.#onChangeUses
    }
  };

  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/crew-header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: `${TEMPLATE_ROOT}/crew-main.hbs`, scrollable: [""] },
    profession: {
      template: `${TEMPLATE_ROOT}/crew-profession.hbs`,
      templates: [ITEM_ROW_TEMPLATE],
      scrollable: [""]
    },
    abilities: {
      template: `${TEMPLATE_ROOT}/crew-abilities.hbs`,
      templates: [ITEM_ROW_TEMPLATE],
      scrollable: [""]
    },
    gear: {
      template: `${TEMPLATE_ROOT}/crew-gear.hbs`,
      templates: [ITEM_ROW_TEMPLATE],
      scrollable: [""]
    }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "main", icon: "fa-solid fa-heart-pulse" },
        { id: "profession", icon: "fa-solid fa-id-badge" },
        { id: "abilities", icon: "fa-solid fa-bolt" },
        { id: "gear", icon: "fa-solid fa-toolbox" }
      ],
      initial: "main",
      labelPrefix: "SCARS.Sheet.Tab"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { actor } = this;
    const system = actor.system;
    const { profession, ability, gear } = actor.itemTypes;
    const mainProfession = sortItems(profession)[0];
    return Object.assign(context, {
      actor,
      system,
      professionName: mainProfession?.name ?? "",
      vitals: [
        buildVital("hp", system.hp, { label: "SCARS.Sheet.hitPoints", critical: system.status.dying }),
        buildVital("sanity", system.sanity, {
          label: "SCARS.Sheet.sanity",
          low: system.status.shaken,
          critical: system.sanity.value === 0,
          horror: true
        })
      ],
      attributeRange: ATTRIBUTE_RANGE,
      attributes: Object.entries(ATTRIBUTES).map(([key, label]) => ({
        key,
        label,
        value: system.attributes[key]
      })),
      profession: await this.#prepareProfession(mainProfession),
      abilities: sortItems(ability).map(buildItemRow),
      gear: sortItems(gear).map(buildItemRow)
    });
  }

  async _preparePartContext(partId, context, options) {
    const partContext = await super._preparePartContext(partId, context, options);
    partContext.tab = partContext.tabs[partId];
    return partContext;
  }

  async #prepareProfession(profession) {
    if (!profession) return null;
    const { TextEditor } = foundry.applications.ux;
    return {
      row: buildItemRow(profession),
      domain: profession.system.domain,
      descriptionHTML: await TextEditor.implementation.enrichHTML(profession.system.description, {
        secrets: this.actor.isOwner,
        relativeTo: profession
      })
    };
  }

  /** An attribute is dragged as a test, for the hotbar; items keep the default drag data. */
  async _onDragStart(event) {
    const { attribute } = event.currentTarget.dataset;
    if (!attribute) return super._onDragStart(event);
    const dragData = { type: TEST_DRAG_TYPE, actorUuid: this.actor.uuid, attribute };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  #findItem(target) {
    const { itemId } = target.closest("[data-item-id]").dataset;
    return this.actor.items.get(itemId);
  }

  static async #onRollTest(event, target) {
    await this.actor.rollTest(target.dataset.attribute);
  }

  static async #onRollHorror() {
    await this.actor.rollHorror();
  }

  static async #onUseItem(event, target) {
    await this.#findItem(target)?.use();
  }

  static #onEditItem(event, target) {
    this.#findItem(target)?.sheet.render({ force: true });
  }

  static async #onDeleteItem(event, target) {
    await this.#findItem(target)?.deleteDialog();
  }

  static async #onChangeUses(event, target) {
    await this.#findItem(target)?.system.changeUses(Number(target.dataset.delta));
  }
}

/**
 * View data for the HP or Sanity monitor. Without an explicit low state, the monitor turns low at half or less.
 */
function buildVital(key, { value, max, bonus }, { label, low, critical, horror = false }) {
  const percent = fillPercent(value, max);
  const isLow = low ?? percent <= 50;
  return {
    key,
    label,
    value,
    max,
    bonus,
    horror,
    segments: buildSegments(value, max),
    state: critical ? "critical" : isLow ? "low" : "stable"
  };
}

function sortItems(items) {
  return [...items].sort((a, b) => a.sort - b.sort);
}

/** View data for one row of an item list on the sheet. */
function buildItemRow(item) {
  const { uses } = item.system;
  return {
    id: item.id,
    name: item.name,
    img: item.img,
    detail: describeItem(item),
    kind: item.type === "gear" ? item.system.formulaType : item.type,
    usable: item.isUsable,
    canUse: item.hasUsesLeft,
    uses: uses?.limited ? buildUsesControl(item) : null,
    unlimited: Boolean(uses?.unlimited),
    oncePerTarget: Boolean(uses?.oncePerTarget)
  };
}

function buildUsesControl(item) {
  const { value, max } = item.system.uses;
  return {
    value,
    max,
    label: item.system.usesLabel ?? "",
    pips: buildSegments(value, max),
    canDecrease: value > 0,
    canIncrease: value < max
  };
}

function describeItem(item) {
  if (item.type === "ability") return item.system.testNotice;
  if (item.type !== "gear" || item.system.formulaType === "none") return "";
  const typeLabel = game.i18n.localize(GEAR_FORMULA_TYPES[item.system.formulaType]);
  return [typeLabel, item.system.formula].filter(Boolean).join(" ");
}
