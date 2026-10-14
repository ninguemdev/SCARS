import { SCARS, SYSTEM_ID, TRACKABLE_ATTRIBUTES } from "./config.mjs";
import { AbilityData } from "./data/ability-data.mjs";
import { CrewData } from "./data/crew-data.mjs";
import { GearData } from "./data/gear-data.mjs";
import { ProfessionData } from "./data/profession-data.mjs";
import { ThreatData } from "./data/threat-data.mjs";
import { CrewSheet } from "./sheets/crew-sheet.mjs";

Hooks.once("init", () => {
  game.scars = { config: SCARS };
  registerDataModels();
  registerSheets();
});

function registerDataModels() {
  Object.assign(CONFIG.Actor.dataModels, { crew: CrewData, threat: ThreatData });
  Object.assign(CONFIG.Item.dataModels, {
    profession: ProfessionData,
    ability: AbilityData,
    gear: GearData
  });
  Object.assign(CONFIG.Actor.trackableAttributes, TRACKABLE_ATTRIBUTES);
}

function registerSheets() {
  foundry.documents.collections.Actors.registerSheet(SYSTEM_ID, CrewSheet, {
    types: ["crew"],
    makeDefault: true,
    label: "SCARS.Sheet.crew"
  });
}
