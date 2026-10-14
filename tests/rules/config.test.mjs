import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ATTRIBUTES,
  ATTRIBUTE_RANGE,
  ATTRIBUTE_SPREAD,
  DIFFICULTIES,
  SCARS
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
      ...Object.values(DIFFICULTIES).map((difficulty) => difficulty.label)
    ];
    for (const key of labelKeys) {
      assert.equal(typeof translate(key), "string", `missing translation for ${key}`);
    }
  });

  it("is frozen so rule values cannot change at runtime", () => {
    assert.ok(Object.isFrozen(SCARS));
    assert.ok(Object.isFrozen(SCARS.difficulties.normal));
  });
});
