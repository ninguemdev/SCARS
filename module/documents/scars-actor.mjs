import { ATTRIBUTES } from "../config.mjs";
import { promptTestOptions } from "../rolls/test-dialog.mjs";
import { rollAttributeTest } from "../rolls/test-roll.mjs";

export class ScarsActor extends foundry.documents.Actor {
  /**
   * Rolls an attribute test. Without a difficulty in the options, asks for difficulty and advantage first.
   * Resolves to the chat message, or null when the player cancels.
   */
  async rollTest(attributeKey, { difficulty, advantage = false } = {}) {
    if (this.system.attributes?.[attributeKey] === undefined) {
      throw new Error(`Actor ${this.name} has no attribute "${attributeKey}"`);
    }
    const options = difficulty === undefined
      ? await promptTestOptions({ title: this.#testTitle(attributeKey) })
      : { difficulty, advantage };
    if (!options) return null;
    return rollAttributeTest(this, attributeKey, options);
  }

  #testTitle(attributeKey) {
    return game.i18n.format("SCARS.Roll.testTitle", {
      attribute: game.i18n.localize(ATTRIBUTES[attributeKey]),
      name: this.name
    });
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

  async #replaceProfessionsWith(profession) {
    const previousIds = this.itemTypes.profession
      .filter((item) => item.id !== profession.id)
      .map((item) => item.id);
    if (!previousIds.length) return;
    await this.deleteEmbeddedDocuments("Item", previousIds);
    ui.notifications.info(game.i18n.format("SCARS.Notify.professionReplaced", { name: profession.name }));
  }
}
