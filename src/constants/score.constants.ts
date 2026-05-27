export const SCORE_TIERS = {
  GOOD: {
    min: 80,
    label: 'Rất tốt',
    bg: '#d1fae5',
    fg: '#065f46',
    ring: 'rgba(16,185,129,.18)',
  },
  OK: {
    min: 60,
    label: 'Khá',
    bg: '#fef3c7',
    fg: '#92400e',
    ring: 'rgba(245,158,11,.18)',
  },
  BAD: {
    min: 0,
    label: 'Cần cân nhắc',
    bg: '#fed7aa',
    fg: '#9a3412',
    ring: 'rgba(249,115,22,.2)',
  },
} as const;

export const MACRO_DEVIATION = {
  GREEN_MAX: 10,
  AMBER_MAX: 20,
} as const;

export const getScoreTier = (score: number) => {
  if (score >= SCORE_TIERS.GOOD.min) return SCORE_TIERS.GOOD;
  if (score >= SCORE_TIERS.OK.min) return SCORE_TIERS.OK;
  return SCORE_TIERS.BAD;
};

export const getMacroDeviationColor = (actual: number, target: number): string => {
  if (target === 0) return '#10b981';

  const percentage = Math.abs((actual - target) / target) * 100;
  if (percentage <= MACRO_DEVIATION.GREEN_MAX) return '#10b981';
  if (percentage <= MACRO_DEVIATION.AMBER_MAX) return '#f59e0b';
  return '#ef4444';
};

