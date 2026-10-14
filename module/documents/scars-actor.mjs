import { ATTRIBUTES, SYSTEM_ID } from "../config.mjs";
import { hitPointsAfterEffect } from "../rules/apply-effect.mjs";
import { EFFECT_TYPES } from "../rules/item-use.mjs";
import { targetsAfterMissionReset, usesAfterMissionReset } from "../rules/mission-reset.mjs";
import { describeSanityDrop } from "../rules/sanity-change.mjs";
import { isValidEffectFormula, postEffectCard, rollEffect } from "../rolls/effect-roll.mjs";
import { HORROR_ATTRIBUTE, rollHorrorTest } from "../rolls/horror-roll.mjs";
import { promptTestOptions } from "../rolls/test-dialog.mjs";
import { rollAttributeTest } from "../rolls/test-roll.mjs";

const GM_ALERT_TEMPLATE = "systems/scars/templates/chat/gm-alert.hbs";

export class ScarsActor extends foundry.documents.Actor {
  /**
   * Rolls an attribute test. Without a difficulty in the options, asks for difficulty and advantage first.
   * Resolves to the chat message, or null when the player cancels.
   */
  async rollTest(attributeKey, { difficulty, advantage = false } = {}) {
    this.#requireAttribute(attributeKey);
    const options = difficulty === undefined
      ? await promptTestOptions({ title: this.#testTitle(attributeKey) })
      : { difficulty, advantage };
    if (!options) return null;
    return rollAttributeTest(this, attributeKey, options);
  }

  /**
   * Rolls a horror test (Nerve). Without a difficulty in the options, asks for difficulty, advantage and heavy scene.
   * On a failure the Sanity loss is applied to the actor.
   */
  async rollHorror({ difficulty, advantage = false, heavyScene = false } = {}) {
    this.#requireAttribute(HORROR_ATTRIBUTE);
    const title = game.i18n.format("SCARS.Roll.horrorTitle", { name: this.name });
    const options = difficulty === undefined
      ? await promptTestOptions({ title, horror: true })
      : { difficulty, advantage, heavyScene };
    if (!options) return null;
    return rollHorrorTest(this, options);
  }

  /**
   * Rolls the damage formula of a threat and posts the card that applies it.
   * Resolves to the chat message, or null when the formula is invalid.
   */
  async rollDamage() {
    if (this.type !== "threat") throw new Error(`Actor ${this.name} of type "${this.type}" has no damage roll`);
    const formula = this.system.damage;
    if (!isValidEffectFormula(formula, this.name)) return null;
    const effect = await rollEffect({ formula, type: EFFECT_TYPES.damage, rollData: this.getRollData() });
    return postEffectCard(this, { name: this.name, img: this.img, effect, flags: { threatDamage: { actorUuid: this.uuid } } });
  }

  /**
   * Applies a damage or healing total to the HP. The result stays between 0 and the maximum.
   * Resolves to the HP before and after, for the notice shown to the user.
   */
  async applyEffect({ type, total }) {
    const { value: before, max } = this.system.hp;
    const after = hitPointsAfterEffect({ value: before, max }, { type, total });
    await this.update({ "system.hp.value": after });
    return { before, after, max };
  }

  /**
   * Gives back the uses of the abilities that restore on a new mission, such as the profession masteries, and clears
   * who received the commander's mastery. Resolves to the number of abilities restored.
   */
  async restoreMissionUses() {
    const updates = this.itemTypes.ability
      .map((ability) => buildMissionResetUpdate(ability))
      .filter(Boolean);
    if (updates.length) await this.updateEmbeddedDocuments("Item", updates);
    return updates.length;
  }

  /** Remembers the Sanity before the update, to detect the thresholds it crosses. */
  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;
    if (this.system.sanity) options.scarsSanityBefore = { ...this.system.sanity };
  }

  /**
   * The GM is told in private when a crew member becomes Shaken or reaches Sanity 0, whatever lowered it.
   * Only the user who made the change sends the alert.
   */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (userId !== game.user.id || !options.scarsSanityBefore) return;
    const drop = describeSanityDrop(options.scarsSanityBefore, this.system.sanity);
    if (drop.becameShaken || drop.reachedZero) this.#alertGameMaster(drop);
  }

  /**
   * An actor keeps a single profession: when a profession is added, the previous ones are removed.
   * Only the user who added the items performs the removal, once per creation batch.
   */
  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
    if (userId !== game.user.id || collection !== "items") return;
    const newProfession = documents.findLast((item) => item.type === "profession");
    if (newProfession) this.#replaceProfessionsWith(newProfession);
  }

  #requireAttribute(attributeKey) {
    if (this.system.attributes?.[attributeKey] === undefined) {
      throw new Error(`Actor ${this.name} has no attribute "${attributeKey}"`);
    }
  }

  #testTitle(attributeKey) {
    return game.i18n.format("SCARS.Roll.testTitle", {
      attribute: game.i18n.localize(ATTRIBUTES[attributeKey]),
      name: this.name
    });
  }

  async #alertGameMaster({ becameShaken, reachedZero }) {
    const gameMasters = game.users.filter((user) => user.isGM).map((user) => user.id);
    if (!gameMasters.length) return;
    const { value, max } = this.system.sanity;
    const alerts = [];
    if (becameShaken) alerts.push(game.i18n.format("SCARS.Notify.becameShaken", { name: this.name, value, max }));
    if (reachedZero) alerts.push(game.i18n.format("SCARS.Notify.sanityZero", { name: this.name }));
    const content = await foundry.applications.handlebars.renderTemplate(GM_ALERT_TEMPLATE, { alerts });
    await ChatMessage.implementation.create({
      speaker: ChatMessage.implementation.getSpeaker({ actor: this }),
      content,
      whisper: gameMasters,
      flags: { [SYSTEM_ID]: { sanityAlert: { becameShaken, reachedZero } } }
    });
  }

  async #replaceProfessionsWith(profession) {
    const previousIds = this.itemTypes.profession
      .filter((item) => item.id !== profession.id)
      .map((item) => item.id);
    if (!previousIds.length) return;
    await this.deleteEmbeddedDocuments("Item", previousIds);
    ui.notifications.info(game.i18n.format("SCARS.Notify.professionReplaced", { name: profession.name }));
  }
}

function buildMissionResetUpdate(ability) {
  const update = {};
  const uses = usesAfterMissionReset(ability.system);
  const targets = targetsAfterMissionReset(ability.system);
  if (uses !== null) update["system.uses.value"] = uses;
  if (targets !== null) update["system.uses.targets"] = targets;
  return Object.keys(update).length ? { _id: ability.id, ...update } : null;
}
