import { htmlField, textField } from "./fields.mjs";

export class ProfessionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      domain: textField(),
      description: htmlField()
    };
  }
}
