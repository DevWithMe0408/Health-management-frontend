import type { ConstitutionCode, GoalCode } from '../types/meal.types';

export const GOAL_LABEL: Record<GoalCode, string> = {
  GIAM: 'Giảm cân',
  DUY_TRI: 'Duy trì',
  TANG: 'Tăng cân',
};

export const CONSTITUTION_LABEL: Record<ConstitutionCode, string> = {
  GAY: 'Gầy',
  CAN_DOI: 'Cân đối',
  THUA_CAN: 'Thừa cân',
  BEO_PHI: 'Béo phì',
};

