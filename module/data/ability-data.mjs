import { MASTERY_USES } from "../config.mjs";
import { clampResource } from "../rules/derived-stats.mjs";
import { booleanField, htmlField, integerField, textField } from "./fields.mjs";
import { changeUsesBy, clampUsesChange } from "./uses.mjs";

export class AbilityData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField } = foundry.data.fields;
    return {
      description: htmlField(),
      uses: new SchemaField({
        value: integerField(MASTERY_USES),
        max: integerField(MASTERY_USES),
        unlimited: booleanField(false)
      }),
      resetsOnMission: booleanField(true),
      testNotice: textField()
    };
  }

  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;
    clampUsesChange(changes, this._source);
  }

  prepareDerivedData() {
    this.uses.value = clampResource(this.uses.value, this.uses.max);
    this.uses.limited = !this.uses.unlimited;
  }

  changeUses(delta) {
    return changeUsesBy(this, delta);
  }
}
