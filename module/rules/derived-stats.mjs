import { RESOURCE_BASE } from "../config.mjs";

/** The bonus comes from items, events or the GM and lets the maximum go past 10 plus the attribute. */
export function maxHitPoints(body, bonus = 0) {
  return RESOURCE_BASE + body + bonus;
}

export function maxSanity(nerve, bonus = 0) {
  return RESOURCE_BASE + nerve + bonus;
}

/** Keeps a current HP or Sanity value between 0 and its maximum. */
export function clampResource(value, max) {
  return Math.min(Math.max(value, 0), max);
}

/** Half of the maximum Sanity, rounded down: at or below it the character is Shaken. */
export function shakenThreshold(sanityMax) {
  return Math.floor(sanityMax / 2);
}

export function isShaken(sanity, sanityMax) {
  return sanity <= shakenThreshold(sanityMax);
}

export function isDying(hitPoints) {
  return hitPoints <= 0;
}
