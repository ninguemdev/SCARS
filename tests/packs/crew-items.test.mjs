import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GEAR_FORMULA_TYPES, MASTERY_USES } from "../../module/config.mjs";

const SOURCE = path.join("packs", "_source", "crew-items");

function readDocuments(folder) {
  const directory = path.join(SOURCE, folder);
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")));
}

const folders = readDocuments("folders");
const items = readDocuments("items");
const byName = (name) => items.find((item) => item.name === name);

describe("crew-items compendium source", () => {
  it("gives every document a unique Foundry id and the key the CLI expects", () => {
    const ids = new Set();
    for (const folder of folders) assert.equal(folder._key, `!folders!${folder._id}`);
    for (const item of items) assert.equal(item._key, `!items!${item._id}`);
    for (const document of [...folders, ...items]) {
      assert.match(document._id, /^[A-Za-z0-9]{16}$/);
      assert.equal(ids.has(document._id), false, `duplicate id ${document._id}`);
      ids.add(document._id);
    }
  });

  it("puts every item in an existing folder", () => {
    const folderIds = new Set(folders.map((folder) => folder._id));
    for (const item of items) assert.ok(folderIds.has(item.folder), `${item.name} has no folder`);
  });

  it("has the five professions, each in its own folder", () => {
    const professions = items.filter((item) => item.type === "profession");
    assert.equal(professions.length, 5);
    assert.equal(new Set(professions.map((profession) => profession.folder)).size, 5);
    for (const profession of professions) assert.ok(profession.system.domain);
  });

  it("gives the counted masteries the uses per mission of the rules", () => {
    const counted = items.filter((item) => item.type === "ability" && !item.system.uses.unlimited
      && !item.system.uses.oncePerTarget);
    assert.equal(counted.length, 4);
    for (const mastery of counted) {
      assert.equal(mastery.system.uses.max, MASTERY_USES, mastery.name);
      assert.equal(mastery.system.uses.value, MASTERY_USES, mastery.name);
      assert.equal(mastery.system.resetsOnMission, true, mastery.name);
    }
  });

  it("marks only the commander's mastery as once per person", () => {
    const oncePerPerson = items.filter((item) => item.system.uses?.oncePerTarget);
    assert.deepEqual(oncePerPerson.map((item) => item.name), ["Na minha nave, não"]);
    assert.equal(byName("Protocolo de comando").system.uses.unlimited, true);
  });

  it("follows the gear numbers of the rules", () => {
    const expected = {
      "Pistola sinalizadora": { formula: "1d6", formulaType: "damage", uses: 9 },
      "Lançadeira": { formula: "", formulaType: "none", uses: 3 },
      "Pulsador EMP portátil": { formula: "", formulaType: "none", uses: 3 },
      "Kit médico": { formula: "1d6", formulaType: "healing", uses: 3 },
      "Seringas de sedativo": { formula: "", formulaType: "none", uses: 2 },
      "Bisturi": { formula: "1d4", formulaType: "damage", uses: 0 },
      "Cortador de plasma": { formula: "1d10", formulaType: "damage", uses: 0 },
      "Drone": { formula: "", formulaType: "none", uses: 1 },
      "Calmantes": { formula: "", formulaType: "none", uses: 10 }
    };
    for (const [name, { formula, formulaType, uses }] of Object.entries(expected)) {
      const gear = byName(name);
      assert.ok(gear, `missing ${name}`);
      assert.equal(gear.system.formula, formula, name);
      assert.equal(gear.system.formulaType, formulaType, name);
      assert.equal(gear.system.uses.max, uses, name);
      assert.equal(gear.system.uses.value, uses, name);
    }
  });

  it("uses only formula types the gear model accepts", () => {
    for (const gear of items.filter((item) => item.type === "gear")) {
      assert.ok(gear.system.formulaType in GEAR_FORMULA_TYPES, gear.name);
    }
  });

  it("keeps the gear every crew member carries in a shared folder", () => {
    const shared = ["Traje de EVA reforçado", "Comunicador", "Lanterna"].map(byName);
    assert.ok(shared.every(Boolean));
    assert.equal(new Set(shared.map((gear) => gear.folder)).size, 1);
  });
});
