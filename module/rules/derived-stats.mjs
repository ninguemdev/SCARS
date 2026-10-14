import { RESOURCE_BASE } from "../config.mjs";

export function maxHitPoints(body) {
  return RESOURCE_BASE + body;
}

export function maxSanity(nerve) {
  return RESOURCE_BASE + nerve;
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
