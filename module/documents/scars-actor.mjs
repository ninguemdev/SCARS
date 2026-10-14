export class ScarsActor extends foundry.documents.Actor {
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
