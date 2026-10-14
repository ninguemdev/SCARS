import { MASTERY_USES } from "../config.mjs";
import { clampResource } from "../rules/derived-stats.mjs";
import { booleanField, htmlField, integerField, textField } from "./fields.mjs";

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
      resetsOnSession: booleanField(true),
      testNotice: textField()
    };
  }

  prepareDerivedData() {
    this.uses.value = clampResource(this.uses.value, this.uses.max);
  }
}
