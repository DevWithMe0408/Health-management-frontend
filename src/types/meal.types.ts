export type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';

export type PlanType = '3_BUA' | '5_BUA';

export type ConstitutionCode = 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';

export type MealType = 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';

export type MealKind = 'COMBO' | 'NHIEU_MON';

export type SlotCode = 'CHINH' | 'RAU' | 'TINH_BOT' | 'COMBO' | 'BUA_PHU';

export type FoodGroup =
  | 'GIA_CAM'
  | 'THIT_DO'
  | 'CA'
  | 'HAI_SAN'
  | 'TRUNG'
  | 'DAU_DO'
  | 'RAU_LA'
  | 'RAU_CU'
  | 'TINH_BOT_GAO'
  | 'TINH_BOT_MI'
  | 'COMBO'
  | 'BUA_PHU'
  | 'GIA_VI';

export type BackendMealStatus =
  | 'SUGGESTED'
  | 'FOLLOWED'
  | 'MODIFIED'
  | 'CUSTOM'
  | 'SKIPPED';

export type UIMealStatus = 'suggested' | 'eaten' | 'skipped';

export interface DailyPlanWarningResponse {
  level: string;
  code: string;
  message: string;
  requireConfirm: boolean;
}

export interface DishSuggestionResponse {
  slotKey: string | null;
  dishId: string;
  dishName: string | null;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  servingMultiplier: number;
  actualGrams: number;
  dishKcal: number;
  favorite: boolean;
}

export interface MealCombinationResponse {
  totalKcal: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  macroScore: number;
  penalty: number;
  finalScore: number;
  dishes: DishSuggestionResponse[];
}

export interface DishOptionResponse {
  dishId: string;
  dishName: string;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  expectedScore: number;
  expectedServing: number;
  expectedActualGrams: number;
  favorite: boolean;
}

export interface MealSuggestionResponse {
  mealType: MealType;
  mealKcalTarget: number;
  kcalTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbTarget: number;
  topCombination: MealCombinationResponse;
  slotAlternatives: Record<string, DishOptionResponse[]>;
}

export interface DailyPlanResponse {
  planDate: string;
  goalCode: GoalCode;
  planType: PlanType;
  warning: DailyPlanWarningResponse | null;
  meals: MealSuggestionResponse[];
}

export interface SwapSuggestion {
  message: string;
  targetSlotKey: string;
  suggestedDishId: string;
  suggestedScore: number;
}

export interface SwapResultResponse {
  updatedMeal: MealSuggestionResponse;
  newFinalScore: number;
  originalFinalScore: number;
  scoreDropTriggered: boolean;
  suggestion: SwapSuggestion | null;
}

export interface PerMealConfigRequest {
  mealKind: MealKind;
  nMain?: number | null;
  nRau?: number | null;
  nCarb?: number | null;
}

export type PerMealConfigMap = Partial<Record<MealType, PerMealConfigRequest>>;

export interface RecommendFullDayRequest {
  tdee: number;
  goalCode: GoalCode;
  planType: PlanType;
  constitution: ConstitutionCode;
  constitutionConfirmed?: boolean;
  perMealConfig: PerMealConfigMap;
  forceCompute?: boolean;
}

export interface PinnedDish {
  slotKey: string;
  dishId: string;
}

export interface SwapDishRequest {
  currentPlan: DailyPlanResponse;
  mealType: MealType;
  swappedSlot: string;
  newDishId: string;
  pinnedDishes?: PinnedDish[];
}

export interface ConfirmMealRequest {
  mealDate: string;
  mealType: MealType;
  planType: PlanType;
  goalCode: GoalCode;
  mealKcalTarget: number;
  selectedCombination: MealCombinationResponse;
}

export interface FavoriteDishResponse {
  userId: string;
  dishId: string;
  createdAt: string;
}

export interface MealLogHistoryResponse {
  id: string;
  mealDate: string;
  mealType: MealType;
  planType: PlanType;
  goalCode: GoalCode;
  mealKcalTarget: number;
  totalKcalActual: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  finalScore: number;
  status: BackendMealStatus;
  dishes: DishSuggestionResponse[];
}

export interface UIMealState {
  meal: MealSuggestionResponse;
  status: UIMealStatus;
  expanded: boolean;
}
