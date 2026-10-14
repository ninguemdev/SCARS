import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ATTRIBUTES,
  ATTRIBUTE_RANGE,
  ATTRIBUTE_SPREAD,
  DIFFICULTIES,
  GEAR_FORMULA_TYPES,
  SCARS,
  THREAT_DEFEAT,
  TRACKABLE_ATTRIBUTES
} from "../../module/config.mjs";

const translations = JSON.parse(
  await readFile(new URL("../../lang/pt-BR.json", import.meta.url), "utf8")
);

function translate(key) {
  return key.split(".").reduce((node, part) => node?.[part], translations);
}

describe("config", () => {
  it("assigns one spread value to each attribute", () => {
    assert.equal(ATTRIBUTE_SPREAD.length, Object.keys(ATTRIBUTES).length);
  });

  it("keeps every spread value inside the attribute range", () => {
    for (const value of ATTRIBUTE_SPREAD) {
      assert.ok(value >= ATTRIBUTE_RANGE.min && value <= ATTRIBUTE_RANGE.max, `${value} out of range`);
    }
  });

  it("orders difficulties from easiest to hardest", () => {
    const values = Object.values(DIFFICULTIES).map((difficulty) => difficulty.value);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
  });

  it("has a pt-BR translation for every label key", () => {
    const labelKeys = [
      ...Object.values(ATTRIBUTES),
      ...Object.values(DIFFICULTIES).map((difficulty) => difficulty.label),
      ...Object.values(THREAT_DEFEAT),
      ...Object.values(GEAR_FORMULA_TYPES)
    ];
    for (const key of labelKeys) {
      assert.equal(typeof translate(key), "string", `missing translation for ${key}`);
    }
  });
  it("has a pt-BR label for every Actor and Item type", () => {
    for (const type of ["crew", "threat"]) {
      assert.equal(typeof translations.TYPES.Actor[type], "string", `missing TYPES.Actor.${type}`);
    }
    for (const type of ["profession", "ability", "gear"]) {
      assert.equal(typeof translations.TYPES.Item[type], "string", `missing TYPES.Item.${type}`);
    }
  });

  it("declares token bars for every Actor type in the manifest", async () => {
    const manifest = JSON.parse(await readFile(new URL("../../system.json", import.meta.url), "utf8"));
    assert.deepEqual(Object.keys(TRACKABLE_ATTRIBUTES).sort(), Object.keys(manifest.documentTypes.Actor).sort());
    assert.ok(TRACKABLE_ATTRIBUTES.crew.bar.includes(manifest.primaryTokenAttribute));
    assert.ok(TRACKABLE_ATTRIBUTES.crew.bar.includes(manifest.secondaryTokenAttribute));
  });

  it("is frozen so rule values cannot change at runtime", () => {
    assert.ok(Object.isFrozen(SCARS));
    assert.ok(Object.isFrozen(SCARS.difficulties.normal));
  });
});
