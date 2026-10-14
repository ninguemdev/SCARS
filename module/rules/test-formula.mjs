import { TEST_DIE } from "../config.mjs";

const NORMAL_DIE = `1d${TEST_DIE.faces}`;

/** With advantage two dice are rolled and only the highest is kept. */
const ADVANTAGE_DIE = `2d${TEST_DIE.faces}kh`;

export function buildTestFormula(attributeValue, { advantage = false } = {}) {
  const die = advantage ? ADVANTAGE_DIE : NORMAL_DIE;
  const sign = attributeValue < 0 ? "-" : "+";
  return `${die} ${sign} ${Math.abs(attributeValue)}`;
}
