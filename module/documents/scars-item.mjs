import { createSystemMessage } from "../helpers/chat-message.mjs";
import {
  buildEffectCardData,
  buildEffectFlags,
  isValidEffectFormula,
  ITEM_CARD_TEMPLATE,
  rollEffect
} from "../rolls/effect-roll.mjs";
import { hasUsesLeft, resolveEffectType } from "../rules/item-use.mjs";

/** Item types that can be used from the sheet: a profession is only a description. */
const USABLE_TYPES = Object.freeze(["ability", "gear"]);

export class ScarsItem extends foundry.documents.Item {
  get isUsable() {
    return USABLE_TYPES.includes(this.type);
  }

  /** False when the item has limited uses and none left. */
  get hasUsesLeft() {
    return hasUsesLeft(this.system.uses);
  }

  /**
   * Uses an ability or gear: spends one use when they are limited, rolls the damage or healing formula when there
   * is one and posts the card. Nothing is spent when the item has no uses left or its formula is invalid.
   * Resolves to the chat message, or null when the item could not be used.
   */
  async use() {
    if (!this.isUsable) throw new Error(`Item ${this.name} of type "${this.type}" cannot be used`);
    if (!this.hasUsesLeft) {
      ui.notifications.warn(game.i18n.format("SCARS.Notify.noUsesLeft", { name: this.name }));
      return null;
    }

    const effectType = resolveEffectType(this.system);
    if (effectType && !isValidEffectFormula(this.system.formula, this.name)) return null;

    const effect = effectType
      ? await rollEffect({ formula: this.system.formula, type: effectType, rollData: this.getRollData() })
      : null;
    if (this.system.uses.limited) await this.system.changeUses(-1);
    return this.#postUseCard(effect);
  }

  async #postUseCard(effect) {
    const content = await foundry.applications.handlebars.renderTemplate(ITEM_CARD_TEMPLATE, {
      name: this.name,
      img: this.img,
      effect: effect ? buildEffectCardData(effect) : null,
      descriptionHTML: effect ? "" : await this.#enrichDescription(),
      testNotice: this.system.testNotice ?? "",
      uses: this.#describeRemainingUses()
    });
    return createSystemMessage(this.actor, {
      content,
      rolls: effect ? [effect.roll] : [],
      flags: {
        itemUse: { itemUuid: this.uuid, itemType: this.type },
        ...(effect && { effect: buildEffectFlags(effect) })
      }
    });
  }

  /** The card is seen by everyone in the chat, so secret blocks of the description stay out of it. */
  #enrichDescription() {
    const { TextEditor } = foundry.applications.ux;
    return TextEditor.implementation.enrichHTML(this.system.description, { secrets: false, relativeTo: this });
  }

  #describeRemainingUses() {
    const { uses, usesLabel } = this.system;
    if (!uses.limited) return null;
    return {
      label: usesLabel || game.i18n.localize("SCARS.Item.uses"),
      value: uses.value,
      max: uses.max
    };
  }
}
