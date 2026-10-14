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
  veryEasy: Object.freeze({ value: 5, label: "SCARS.Difficulty.veryEasy" }),
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

/**
 * Uses per mission of a profession mastery; the "Nova missão" command restores them.
 * The commander's mastery is the exception: once per ally in each mission.
 */
export const MASTERY_USES = 3;

export const THREAT_DEFEAT = Object.freeze({
  hp: "SCARS.Defeat.hp",
  successes: "SCARS.Defeat.successes"
});

/** Starting values for a new threat, taken from the examples in the rules. */
export const THREAT_DEFAULTS = Object.freeze({
  damage: "1d6",
  hp: 8,
  successesToDefeat: 3
});

export const GEAR_FORMULA_TYPES = Object.freeze({
  none: "SCARS.FormulaType.none",
  damage: "SCARS.FormulaType.damage",
  healing: "SCARS.FormulaType.healing"
});

/**
 * Token bar and value attributes per Actor type.
 * Crew HP and Sanity maximums are derived, so Foundry cannot find these bars from the schema alone.
 */
export const TRACKABLE_ATTRIBUTES = Object.freeze({
  crew: Object.freeze({ bar: ["hp", "sanity"], value: [] }),
  threat: Object.freeze({ bar: ["hp", "successes"], value: ["difficulty"] })
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
  shipClock: SHIP_CLOCK,
  masteryUses: MASTERY_USES,
  threatDefeat: THREAT_DEFEAT,
  threatDefaults: THREAT_DEFAULTS,
  gearFormulaTypes: GEAR_FORMULA_TYPES
});
