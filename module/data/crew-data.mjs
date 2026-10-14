import { ATTRIBUTES, ATTRIBUTE_RANGE, RESOURCE_BASE } from "../config.mjs";
import {
  clampResource,
  isDying,
  isShaken,
  maxHitPoints,
  maxSanity
} from "../rules/derived-stats.mjs";
import { htmlField, integerField, textField } from "./fields.mjs";

export class CrewData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField } = foundry.data.fields;
    return {
      attributes: new SchemaField(buildAttributeFields()),
      hp: new SchemaField({ value: integerField(RESOURCE_BASE) }),
      sanity: new SchemaField({ value: integerField(RESOURCE_BASE) }),
      profile: new SchemaField({
        player: textField(),
        origin: textField(),
        motivation: textField()
      }),
      secret: htmlField(),
      notes: htmlField()
    };
  }

  prepareDerivedData() {
    this.hp.max = maxHitPoints(this.attributes.body);
    this.hp.value = clampResource(this.hp.value, this.hp.max);
    this.sanity.max = maxSanity(this.attributes.nerve);
    this.sanity.value = clampResource(this.sanity.value, this.sanity.max);
    this.status = {
      shaken: isShaken(this.sanity.value, this.sanity.max),
      dying: isDying(this.hp.value)
    };
  }
}

function buildAttributeFields() {
  const { min, max } = ATTRIBUTE_RANGE;
  const entries = Object.keys(ATTRIBUTES).map((key) => [key, integerField(min, { min, max })]);
  return Object.fromEntries(entries);
}
