export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';

export type ConstitutionCode = 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';

export type PbfMethod = 'FORMULA' | 'MODEL_1';

export type UserPreferenceKey =
  | 'pbf_method'
  | 'MEAL_PLAN_TYPE'
  | 'BREAKFAST_CONFIG'
  | 'SNACK_AM_CONFIG'
  | 'LUNCH_CONFIG'
  | 'SNACK_PM_CONFIG'
  | 'DINNER_CONFIG';

export type OnboardingBaseMetricType =
  | 'HEIGHT'
  | 'WEIGHT'
  | 'WAIST'
  | 'HIP'
  | 'NECK'
  | 'BUST'
  | 'ACTIVITY_FACTOR';
