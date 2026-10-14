import { DIFFICULTIES, THREAT_DEFAULTS, THREAT_DEFEAT } from "../config.mjs";
import { clampResource } from "../rules/derived-stats.mjs";
import { isThreatDefeated } from "../rules/threat-defeat.mjs";
import { choiceField, htmlField, integerField, textField } from "./fields.mjs";
import { clampValueChange } from "./uses.mjs";

export class ThreatData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField } = foundry.data.fields;
    return {
      difficulty: integerField(DIFFICULTIES.normal.value, { min: 1 }),
      damage: textField(THREAT_DEFAULTS.damage),
      defeat: choiceField(THREAT_DEFEAT, "hp"),
      hp: new SchemaField({
        value: integerField(THREAT_DEFAULTS.hp),
        max: integerField(THREAT_DEFAULTS.hp)
      }),
      successes: new SchemaField({
        value: integerField(0),
        max: integerField(THREAT_DEFAULTS.successesToDefeat, { min: 1 })
      }),
      description: htmlField()
    };
  }

  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;
    clampValueChange(changes, this._source, "hp");
    clampValueChange(changes, this._source, "successes");
  }

  prepareDerivedData() {
    this.hp.value = clampResource(this.hp.value, this.hp.max);
    this.successes.value = clampResource(this.successes.value, this.successes.max);
    this.defeated = isThreatDefeated(this);
  }
}
