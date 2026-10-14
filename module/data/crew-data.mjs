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
      hp: new SchemaField({ value: integerField(RESOURCE_BASE), bonus: integerField(0) }),
      sanity: new SchemaField({ value: integerField(RESOURCE_BASE), bonus: integerField(0) }),
      profile: new SchemaField({
        player: textField(),
        origin: textField(),
        motivation: textField()
      }),
      secret: htmlField(),
      notes: htmlField()
    };
  }

  /** A new crew member starts with full HP and Sanity unless the creation data sets them. */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    const { attributes, hp, sanity } = this._source;
    const startingValues = {};
    if (foundry.utils.getProperty(data, "system.hp.value") === undefined) {
      startingValues["system.hp.value"] = maxHitPoints(attributes.body, hp.bonus);
    }
    if (foundry.utils.getProperty(data, "system.sanity.value") === undefined) {
      startingValues["system.sanity.value"] = maxSanity(attributes.nerve, sanity.bonus);
    }
    this.parent.updateSource(startingValues);
  }

  prepareDerivedData() {
    this.hp.max = maxHitPoints(this.attributes.body, this.hp.bonus);
    this.hp.value = clampResource(this.hp.value, this.hp.max);
    this.sanity.max = maxSanity(this.attributes.nerve, this.sanity.bonus);
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
