/**
 * Rule constants for the SCARS system.
 * This module must stay free of Foundry globals so the rules layer and tests can import it.
 */

export const SYSTEM_ID = "scars";

export const ATTRIBUTES = Object.freeze({
  body: "SCARS.Attribute.body",
  reflexes: "SCARS.Attribute.reflexes",
  mind: "SCARS.Attribute.mind",
  nerve: "SCARS.Attribute.nerve"
});

export const ATTRIBUTE_RANGE = Object.freeze({ min: 0, max: 3 });

/** Each value is assigned to exactly one attribute at character creation. */
export const ATTRIBUTE_SPREAD = Object.freeze([3, 2, 1, 0]);

export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({ value: 10, label: "SCARS.Difficulty.easy" }),
  normal: Object.freeze({ value: 15, label: "SCARS.Difficulty.normal" }),
  hard: Object.freeze({ value: 20, label: "SCARS.Difficulty.hard" })
});

export const TEST_DIE = Object.freeze({
  faces: 20,
  criticalSuccess: 20,
  criticalFailure: 1
});

/** HP and Sanity maximums are this base plus Body and Nerve. */
export const RESOURCE_BASE = 10;

export const HORROR_LOSS = Object.freeze({
  normal: "1d4",
  heavy: "1d6"
});

export const SHIP_CLOCK = Object.freeze({
  segments: 8,
  milestones: Object.freeze({
    protocolRequiresTest: 4,
    shuttleBreached: 6,
    end: 8
  })
});

export const SCARS = Object.freeze({
  systemId: SYSTEM_ID,
  attributes: ATTRIBUTES,
  attributeRange: ATTRIBUTE_RANGE,
  attributeSpread: ATTRIBUTE_SPREAD,
  difficulties: DIFFICULTIES,
  testDie: TEST_DIE,
  resourceBase: RESOURCE_BASE,
  horrorLoss: HORROR_LOSS,
  shipClock: SHIP_CLOCK
});
