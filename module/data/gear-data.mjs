import { GEAR_FORMULA_TYPES } from "../config.mjs";
import { clampResource } from "../rules/derived-stats.mjs";
import { choiceField, htmlField, integerField, textField } from "./fields.mjs";

export class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField } = foundry.data.fields;
    return {
      description: htmlField(),
      formula: textField(),
      formulaType: choiceField(GEAR_FORMULA_TYPES, "none"),
      uses: new SchemaField({
        value: integerField(0),
        max: integerField(0)
      }),
      usesLabel: textField()
    };
  }

  prepareDerivedData() {
    this.uses.value = clampResource(this.uses.value, this.uses.max);
    // A maximum of 0 means the gear is not limited by uses, like a scalpel or a flashlight.
    this.uses.limited = this.uses.max > 0;
  }
}
