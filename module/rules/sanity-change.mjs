import { isShaken } from "./derived-stats.mjs";

/**
 * Which Sanity thresholds a change crossed on the way down: becoming Shaken (half or less) and reaching 0.
 * Each side is `{ value, max }`, so a higher maximum with the same current value can also make a character Shaken.
 */
export function describeSanityDrop(before, after) {
  return {
    becameShaken: !isShaken(before.value, before.max) && isShaken(after.value, after.max),
    reachedZero: before.value > 0 && after.value === 0
  };
}
