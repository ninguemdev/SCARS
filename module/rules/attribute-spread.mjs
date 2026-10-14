import { ATTRIBUTES, ATTRIBUTE_SPREAD } from "../config.mjs";

const descending = (a, b) => b - a;

const EXPECTED_SPREAD = [...ATTRIBUTE_SPREAD].sort(descending);

/**
 * True when the attributes use each spread value exactly once.
 * The sheet only warns about an invalid spread; it never blocks it.
 */
export function isValidAttributeSpread(attributes) {
  const values = Object.keys(ATTRIBUTES).map((key) => attributes[key]);
  const sortedValues = [...values].sort(descending);
  return sortedValues.every((value, index) => value === EXPECTED_SPREAD[index]);
}
