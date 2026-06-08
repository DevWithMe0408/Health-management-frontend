import type { ConstitutionResponse } from '../services/constitution.service';
import type { DashboardMetricsResponse } from '../services/dashboard.service';
import type { GoalCode } from '../types/refactorUi.types';

const BMI_NORMAL_LOW = 18.5;
const BMI_NORMAL_HIGH = 23;
const KCAL_PER_KG = 7700;
const ENERGY_FRACTION: Record<'GIAM' | 'TANG', number> = {
  GIAM: 0.2,
  TANG: 0.15,
};
const RATE_MIN = 0.2;
const RATE_MAX = 0.7;
const GOAL_DURATION_MAX_MONTHS = 24;

export type RoadmapMode = 'GIAM' | 'TANG' | 'DUY_TRI' | 'DAC_BIET';

export interface RoadmapResult {
  state: 'normal' | 'incomplete';
  mode?: RoadmapMode;
  current?: number;
  low?: number;
  high?: number;
  delta?: number;
  speed?: string;
  time?: string;
  pbf?: number | null;
  suggestedGoal?: GoalCode;
  suggestedTargetKg?: number | null;
  suggestedDurationMonths?: number;
  missing?: string[];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

const deriveMode = (
  bmiClass: number | null,
  finalClass: number,
): RoadmapMode => {
  if (finalClass === 0) return 'TANG';
  if (finalClass === 1) return 'DUY_TRI';
  if (bmiClass != null && bmiClass >= 2) return 'GIAM';
  return 'DAC_BIET';
};

export const computeRoadmap = (
  constitution: ConstitutionResponse | null,
  metrics: DashboardMetricsResponse | null,
): RoadmapResult => {
  const finalClass = constitution?.finalClass ?? null;
  const bmiClass = constitution?.bmiClass ?? null;
  const weight = metrics?.weight?.value ?? null;
  const height = metrics?.height?.value ?? null;
  const tdee = metrics?.tdee?.value ?? null;
  const pbf = constitution?.pbf ?? null;

  if (constitution == null || finalClass == null) {
    return {
      state: 'incomplete',
      missing: ['Thể trạng'],
    };
  }

  if (weight == null || height == null) {
    const missing: string[] = [];
    if (height == null) missing.push('Chiều cao');
    if (weight == null) missing.push('Cân nặng');
    return { state: 'incomplete', missing };
  }

  const mode = deriveMode(bmiClass, finalClass);
  const heightMetersSquared = (height / 100) ** 2;
  const low = round1(BMI_NORMAL_LOW * heightMetersSquared);
  const high = round1(BMI_NORMAL_HIGH * heightMetersSquared);
  const current = round1(weight);

  if (mode === 'DUY_TRI') {
    return {
      state: 'normal',
      mode,
      current,
      low,
      high,
      pbf,
      suggestedGoal: 'DUY_TRI',
      suggestedTargetKg: null,
      suggestedDurationMonths: 6,
    };
  }

  if (mode === 'DAC_BIET') {
    return {
      state: 'normal',
      mode,
      current,
      low,
      high,
      pbf,
      suggestedGoal: 'GIAM',
      suggestedTargetKg: null,
      suggestedDurationMonths: 6,
    };
  }

  if (tdee == null) {
    return {
      state: 'incomplete',
      missing: ['TDEE'],
    };
  }

  const isLoss = mode === 'GIAM';
  const delta = round1(isLoss ? weight - high : low - weight);
  const targetKg = isLoss ? high : low;
  const fraction = ENERGY_FRACTION[isLoss ? 'GIAM' : 'TANG'];
  const pointKgPerWeek = (tdee * fraction * 7) / KCAL_PER_KG;
  const upper = clamp(round1(pointKgPerWeek), RATE_MIN, RATE_MAX);
  const lower = clamp(round1(pointKgPerWeek * 0.6), RATE_MIN, upper);
  const speed = lower === upper ? `${upper}` : `${lower}-${upper}`;
  const fastMonths = Math.max(1, Math.round(delta / upper / 4.345));
  const slowMonths = Math.max(fastMonths, Math.round(delta / lower / 4.345));
  const targetDurationMonths = clamp(slowMonths, 1, GOAL_DURATION_MAX_MONTHS);
  const time =
    fastMonths === slowMonths
      ? `khoảng ${fastMonths} tháng`
      : `${fastMonths}-${slowMonths} tháng`;

  return {
    state: 'normal',
    mode,
    current,
    low,
    high,
    delta,
    speed,
    time,
    pbf,
    suggestedGoal: mode,
    suggestedTargetKg: round1(targetKg),
    suggestedDurationMonths: targetDurationMonths,
  };
};
