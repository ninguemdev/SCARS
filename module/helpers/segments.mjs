/** Above this many segments a meter shows only the numbers; the segments would be too thin to read. */
export const MAX_SEGMENTS = 24;

/**
 * The segments of a meter such as HP or uses: one per point of the maximum, filled up to the current value.
 * Resolves to an empty list when the maximum is too large to draw.
 */
export function buildSegments(value, max) {
  if (!Number.isInteger(max) || max <= 0 || max > MAX_SEGMENTS) return [];
  return Array.from({ length: max }, (_, index) => ({ filled: index < value }));
}

/** Share of the maximum, from 0 to 100, used to color a meter as it empties. */
export function fillPercent(value, max) {
  if (!max) return 0;
  return Math.round(Math.min(Math.max(value / max, 0), 1) * 100);
}
