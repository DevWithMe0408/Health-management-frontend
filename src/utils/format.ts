/**
 * Format a serving multiplier without truncating non-half steps.
 * The system serving grid uses values like 0.5, 0.75, 1.0, 1.5, 2.0 — using
 * toFixed(1) would render 0.75 as "0.8" which is misleading. Two decimals
 * with trailing zeros stripped keeps every grid value accurate.
 */
export const formatServing = (value: number): string => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2).replace(/\.?0+$/, '');
};
