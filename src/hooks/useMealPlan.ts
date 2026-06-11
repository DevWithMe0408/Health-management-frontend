import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  dayPlan,
  swapDish,
} from '../services/meal.service';
import { updateMealStatus as patchMealStatus } from '../services/mealLog.service';
import { useAuth } from '../contexts/AuthContext';
import type { NutritionPreferences } from './useMealPreferences';
import type { NutritionUserContextData } from './useUserContext';
import type {
  BackendMealStatus,
  DailyPlanResponse,
  DishSuggestionResponse,
  MealSuggestionWithCombination,
  MealType,
  PlanDay,
  PinnedDish,
  SwapResultResponse,
  SwapSuggestion,
  UIMealState,
  UIMealStatus,
  WarningResponse,
} from '../types/meal.types';

// One pin entry per slot of a meal. overrideGrams forces a fixed serving
// for the BE engine; without it the engine is free to optimize the slot.
interface PinEntry {
  dishId: string;
  overrideGrams: number;
}

export type PinsByMeal = Map<MealType, Map<string, PinEntry>>;

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

interface CachedMealPlan {
  cachedAt: number;
  plan: DailyPlanResponse;
  mealStates: UIMealState[];
}

export interface ScoreDropEvent {
  mealType: MealType;
  from: number;
  to: number;
}

interface SwapSnapshot {
  plan: DailyPlanResponse;
  mealStates: UIMealState[];
}

interface UseMealPlanParams {
  userContext: NutritionUserContextData | null;
  preferences: NutritionPreferences | null;
}

interface UseMealPlanResult {
  plan: DailyPlanResponse | null;
  mealStates: UIMealState[];
  loading: boolean;
  error: string | null;
  swapLoading: boolean;
  confirmLoading: MealType | null;
  scoreDropEvent: ScoreDropEvent | null;
  lastSwapSuggestion: SwapSuggestion | null;
  // MealType of the meal whose swap produced `lastSwapSuggestion`. Page uses
  // this to attach the suggestion banner to the right MealCard.
  lastSwapSuggestionMealType: MealType | null;
  lastWarnings: WarningResponse[];
  pinsByMeal: PinsByMeal;
  planDay: PlanDay;
  generate: (options?: GenerateMealPlanOptions) => Promise<DailyPlanResponse | null>;
  swap: (
    mealType: MealType,
    swappedSlot: string,
    newDishId: string
  ) => Promise<DailyPlanResponse | null>;
  // Phase 2 entry point: applies (or updates) a pin for `swappedSlot` and
  // re-sends every pin of the same meal so the BE engine keeps them fixed.
  // Returns the raw SwapResultResponse so callers can inspect warnings
  // before deciding whether to close the swap drawer.
  applyPin: (
    mealType: MealType,
    swappedSlot: string,
    newDishId: string,
    overrideGrams: number
  ) => Promise<SwapResultResponse | null>;
  // Local-only unpin: drops the slot from `pinsByMeal` without calling BE.
  // Next applyPin for this meal will not include the dropped pin.
  unpin: (mealType: MealType, slotKey: string) => void;
  dismissWarnings: () => void;
  dismissSuggestion: () => void;
  confirm: (mealType: MealType) => Promise<void>;
  skip: (mealType: MealType) => Promise<void>;
  toggleExpand: (mealType: MealType) => void;
  setDishFavorite: (dishId: string, favorite: boolean) => void;
  dismissScoreDropEvent: () => void;
  revertSwap: () => void;
}

interface GenerateMealPlanOptions {
  forceCompute?: boolean;
  constitutionConfirmed?: boolean;
  planDay?: PlanDay;
  forceRegenerate?: boolean;
}

const toUiStatus = (status: BackendMealStatus | null | undefined): UIMealStatus => {
  if (status === 'FOLLOWED' || status === 'MODIFIED' || status === 'CUSTOM') return 'eaten';
  if (status === 'SKIPPED') return 'skipped';
  return 'suggested';
};

const buildInitialMealStates = (plan: DailyPlanResponse): UIMealState[] => {
  return getRenderableMeals(plan).map((meal, index) => ({
    meal,
    status: toUiStatus(meal.status),
    expanded: index === 0,
  }));
};

const hasRenderableCombination = (
  meal: DailyPlanResponse['meals'][number]
): meal is MealSuggestionWithCombination => {
  return Boolean(meal.topCombination && meal.topCombination.dishes.length > 0);
};

const getRenderableMeals = (plan: DailyPlanResponse): MealSuggestionWithCombination[] => {
  return plan.meals.filter(hasRenderableCombination);
};

const getInvalidMealCount = (plan: DailyPlanResponse) => {
  return plan.meals.length - getRenderableMeals(plan).length;
};

const hasPersistedMealLogData = (plan: DailyPlanResponse) => {
  const renderableMeals = getRenderableMeals(plan);
  return renderableMeals.length > 0 && renderableMeals.every((meal) => Boolean(meal.mealLogId));
};

const getUnavailableMealMessage = (invalidMealCount: number, totalMealCount: number) => {
  if (totalMealCount === 0) {
    return 'API đã trả về 200 nhưng chưa có bữa ăn nào trong thực đơn.';
  }

  if (invalidMealCount === totalMealCount) {
    return 'API đã trả về 200 nhưng chưa có bữa nào tìm được tổ hợp món hợp lệ.';
  }

  return `${invalidMealCount} bữa chưa tìm được tổ hợp món hợp lệ nên chưa được hiển thị.`;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getCacheKey = (userId: string | null | undefined, planDay: PlanDay) => {
  return `nutrition-plan-${userId ?? 'anonymous'}-${getTodayKey()}-${planDay}`;
};

const readCachedMealPlan = (cacheKey: string): CachedMealPlan | null => {
  const rawCache = sessionStorage.getItem(cacheKey);
  if (!rawCache) return null;

  try {
    const parsed = JSON.parse(rawCache) as CachedMealPlan;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(cacheKey);
    return null;
  }
};

const writeCachedMealPlan = (
  cacheKey: string,
  plan: DailyPlanResponse,
  mealStates: UIMealState[]
) => {
  const cache: CachedMealPlan = {
    cachedAt: Date.now(),
    plan,
    mealStates,
  };
  sessionStorage.setItem(cacheKey, JSON.stringify(cache));
};

const replaceMealInPlan = (
  currentPlan: DailyPlanResponse,
  mealType: MealType,
  updatedMeal: DailyPlanResponse['meals'][number]
): DailyPlanResponse => ({
  ...currentPlan,
  meals: currentPlan.meals.map((meal) => (meal.mealType === mealType ? updatedMeal : meal)),
});

const replaceMealInStates = (
  currentStates: UIMealState[],
  mealType: MealType,
  updatedMeal: DailyPlanResponse['meals'][number]
): UIMealState[] => {
  if (!hasRenderableCombination(updatedMeal)) return currentStates;

  return currentStates.map((state) =>
    state.meal.mealType === mealType ? { ...state, meal: updatedMeal } : state
  );
};

const updateMealStatus = (
  currentStates: UIMealState[],
  mealType: MealType,
  status: UIMealState['status']
): UIMealState[] => {
  return currentStates.map((state) =>
    state.meal.mealType === mealType ? { ...state, status } : state
  );
};

const updateMealStatusInPlan = (
  currentPlan: DailyPlanResponse,
  mealType: MealType,
  status: BackendMealStatus
): DailyPlanResponse => ({
  ...currentPlan,
  meals: currentPlan.meals.map((meal) =>
    meal.mealType === mealType ? { ...meal, status } : meal
  ),
});

const buildPinnedDishes = (
  mealDishes: DishSuggestionResponse[],
  swappedSlot: string
) => {
  return mealDishes
    .filter((dish) => dish.slotKey && dish.slotKey !== swappedSlot)
    .map((dish) => ({
      slotKey: dish.slotKey as string,
      dishId: dish.dishId,
    }));
};

const updateFavoriteInPlan = (
  currentPlan: DailyPlanResponse,
  dishId: string,
  favorite: boolean
): DailyPlanResponse => ({
  ...currentPlan,
  meals: currentPlan.meals.map((meal) => ({
    ...meal,
    topCombination: meal.topCombination
      ? {
          ...meal.topCombination,
          dishes: meal.topCombination.dishes.map((dish) =>
            dish.dishId === dishId ? { ...dish, favorite } : dish
          ),
        }
      : null,
    slotAlternatives: Object.fromEntries(
      Object.entries(meal.slotAlternatives).map(([slotKey, options]) => [
        slotKey,
        options.map((option) =>
          option.dishId === dishId ? { ...option, favorite } : option
        ),
      ])
    ),
  })),
});

export const useMealPlan = ({
  userContext,
  preferences,
}: UseMealPlanParams): UseMealPlanResult => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<DailyPlanResponse | null>(null);
  const [mealStates, setMealStates] = useState<UIMealState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<MealType | null>(null);
  const [scoreDropEvent, setScoreDropEvent] = useState<ScoreDropEvent | null>(null);
  const [lastSwapSuggestion, setLastSwapSuggestion] = useState<SwapSuggestion | null>(null);
  const [lastSwapSuggestionMealType, setLastSwapSuggestionMealType] =
    useState<MealType | null>(null);
  const [lastWarnings, setLastWarnings] = useState<WarningResponse[]>([]);
  const [pinsByMeal, setPinsByMeal] = useState<PinsByMeal>(() => new Map());
  const [swapSnapshot, setSwapSnapshot] = useState<SwapSnapshot | null>(null);
  const [planDay, setPlanDay] = useState<PlanDay>('TODAY');

  const cacheKey = useMemo(() => getCacheKey(user?.userId, planDay), [user?.userId, planDay]);

  useEffect(() => {
    if (!userContext || !preferences || plan || loading) return;

    const cached = readCachedMealPlan(cacheKey);
    if (!cached) return;
    if (
      cached.plan.goalCode !== userContext.goalCode ||
      cached.plan.planType !== preferences.planType
    ) {
      sessionStorage.removeItem(cacheKey);
      return;
    }
    if (!hasPersistedMealLogData(cached.plan)) {
      sessionStorage.removeItem(cacheKey);
      return;
    }

    const cachedStates = cached.mealStates.filter((state) =>
      hasRenderableCombination(state.meal)
    );

    setPlan(cached.plan);
    setMealStates(cachedStates.length > 0 ? cachedStates : buildInitialMealStates(cached.plan));
  }, [cacheKey, loading, plan, preferences, userContext]);

  const persistPlan = useCallback(
    (nextPlan: DailyPlanResponse, nextStates: UIMealState[], key: string = cacheKey) => {
      setPlan(nextPlan);
      setMealStates(nextStates);
      writeCachedMealPlan(key, nextPlan, nextStates);
    },
    [cacheKey]
  );

  const generate = useCallback(async (options: GenerateMealPlanOptions = {}) => {
    if (!userContext || !preferences) return null;

    const effectiveDay: PlanDay = options.planDay ?? planDay;
    const effectiveKey = getCacheKey(user?.userId, effectiveDay);
    const isSwitchingDay = effectiveDay !== planDay;

    if (!options.forceRegenerate) {
      const cached = readCachedMealPlan(effectiveKey);
      if (cached && !hasPersistedMealLogData(cached.plan)) {
        sessionStorage.removeItem(effectiveKey);
      }
      if (
        cached &&
        cached.plan.goalCode === userContext.goalCode &&
        cached.plan.planType === preferences.planType &&
        hasPersistedMealLogData(cached.plan)
      ) {
        if (isSwitchingDay) setPlanDay(effectiveDay);
        const cachedStates = cached.mealStates.filter((state) =>
          hasRenderableCombination(state.meal)
        );
        setError(null);
        setScoreDropEvent(null);
        setLastSwapSuggestion(null);
        setLastSwapSuggestionMealType(null);
        setLastWarnings([]);
        setPinsByMeal(new Map());
        setSwapSnapshot(null);
        setPlan(cached.plan);
        setMealStates(
          cachedStates.length > 0 ? cachedStates : buildInitialMealStates(cached.plan)
        );
        return cached.plan;
      }
    }

    if (isSwitchingDay) {
      setPlanDay(effectiveDay);
      setPlan(null);
      setMealStates([]);
    }

    setLoading(true);
    setError(null);
    setScoreDropEvent(null);
    setLastSwapSuggestion(null);
    setLastSwapSuggestionMealType(null);
    setLastWarnings([]);
    setPinsByMeal(new Map());
    setSwapSnapshot(null);

    try {
      const nextPlan = await dayPlan({
        tdee: userContext.tdee,
        goalCode: userContext.goalCode,
        planType: preferences.planType,
        constitution: userContext.constitution,
        constitutionConfirmed: options.constitutionConfirmed ?? false,
        perMealConfig: preferences.perMealConfig,
        forceCompute: options.forceCompute ?? false,
        planDay: effectiveDay,
        forceRegenerate: options.forceRegenerate ?? false,
      });
      const nextStates = buildInitialMealStates(nextPlan);
      const needsConstitutionConfirmation = Boolean(
        nextPlan.warning?.requireConfirm &&
          nextPlan.meals.length === 0 &&
          !options.constitutionConfirmed
      );

      if (needsConstitutionConfirmation) {
        setPlan(null);
        setMealStates([]);
        sessionStorage.removeItem(effectiveKey);
        return nextPlan;
      }

      const invalidMealCount = getInvalidMealCount(nextPlan);
      if (invalidMealCount > 0) {
        setError(getUnavailableMealMessage(invalidMealCount, nextPlan.meals.length));
      }

      if (nextStates.length === 0) {
        setPlan(null);
        setMealStates([]);
        sessionStorage.removeItem(effectiveKey);
        return nextPlan;
      }

      persistPlan(nextPlan, nextStates, effectiveKey);
      return nextPlan;
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Không thể tạo thực đơn.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistPlan, planDay, preferences, user?.userId, userContext]);

  const swap = useCallback(async (
    mealType: MealType,
    swappedSlot: string,
    newDishId: string
  ) => {
    if (!plan) return null;

    const targetMeal = plan.meals.find((meal) => meal.mealType === mealType);
    if (!targetMeal) return null;
    if (!targetMeal.topCombination) {
      setError('Bữa này chưa có tổ hợp món hợp lệ để đổi món.');
      return null;
    }

    const snapshot: SwapSnapshot = { plan, mealStates };
    setSwapSnapshot(snapshot);
    setSwapLoading(true);
    setError(null);

    try {
      const result = await swapDish({
        currentPlan: plan,
        mealType,
        swappedSlot,
        newDishId,
        pinnedDishes: buildPinnedDishes(targetMeal.topCombination.dishes, swappedSlot),
      });

      const nextPlan = replaceMealInPlan(plan, mealType, result.updatedMeal);
      const nextStates = replaceMealInStates(mealStates, mealType, result.updatedMeal);
      persistPlan(nextPlan, nextStates);
      setLastSwapSuggestion(result.suggestion);
      setLastSwapSuggestionMealType(result.suggestion ? mealType : null);
      setLastWarnings(result.warnings ?? []);
      setScoreDropEvent(
        result.scoreDropTriggered
          ? {
              mealType,
              from: result.originalFinalScore,
              to: result.newFinalScore,
            }
          : null
      );
      return nextPlan;
    } catch (swapError) {
      setSwapSnapshot(null);
      setError(swapError instanceof Error ? swapError.message : 'Không thể đổi món.');
      return null;
    } finally {
      setSwapLoading(false);
    }
  }, [mealStates, persistPlan, plan]);

  const applyPin = useCallback(async (
    mealType: MealType,
    swappedSlot: string,
    newDishId: string,
    overrideGrams: number
  ) => {
    if (!plan) return null;

    const targetMeal = plan.meals.find((meal) => meal.mealType === mealType);
    if (!targetMeal) return null;

    const snapshot: SwapSnapshot = { plan, mealStates };
    setSwapSnapshot(snapshot);
    setSwapLoading(true);
    setError(null);

    try {
      // Forward every pin of this meal so the BE engine keeps them fixed.
      // The swapped slot is appended last with the user's overrideGrams.
      const existingPins = pinsByMeal.get(mealType);
      const pinnedDishes: PinnedDish[] = [];

      if (existingPins) {
        for (const [slotKey, pin] of existingPins) {
          if (slotKey === swappedSlot) continue;
          pinnedDishes.push({
            slotKey,
            dishId: pin.dishId,
            overrideGrams: pin.overrideGrams,
          });
        }
      }

      pinnedDishes.push({
        slotKey: swappedSlot,
        dishId: newDishId,
        overrideGrams,
      });

      const result = await swapDish({
        currentPlan: plan,
        mealType,
        swappedSlot,
        newDishId,
        pinnedDishes,
      });

      const nextPlan = replaceMealInPlan(plan, mealType, result.updatedMeal);
      const nextStates = replaceMealInStates(mealStates, mealType, result.updatedMeal);
      persistPlan(nextPlan, nextStates);

      setPinsByMeal((prev) => {
        const next = new Map(prev);
        const mealPins = new Map(next.get(mealType) ?? new Map<string, PinEntry>());
        mealPins.set(swappedSlot, { dishId: newDishId, overrideGrams });
        next.set(mealType, mealPins);
        return next;
      });

      setLastSwapSuggestion(result.suggestion);
      setLastSwapSuggestionMealType(result.suggestion ? mealType : null);
      setLastWarnings(result.warnings ?? []);
      setScoreDropEvent(
        result.scoreDropTriggered
          ? {
              mealType,
              from: result.originalFinalScore,
              to: result.newFinalScore,
            }
          : null
      );

      return result;
    } catch (applyError) {
      setSwapSnapshot(null);
      setError(applyError instanceof Error ? applyError.message : 'Không thể đổi món.');
      return null;
    } finally {
      setSwapLoading(false);
    }
  }, [mealStates, persistPlan, pinsByMeal, plan]);

  const unpin = useCallback((mealType: MealType, slotKey: string) => {
    setPinsByMeal((prev) => {
      const next = new Map(prev);
      const mealPins = new Map(next.get(mealType) ?? new Map<string, PinEntry>());
      mealPins.delete(slotKey);
      if (mealPins.size === 0) next.delete(mealType);
      else next.set(mealType, mealPins);
      return next;
    });
  }, []);

  const dismissWarnings = useCallback(() => {
    setLastWarnings([]);
  }, []);

  const dismissSuggestion = useCallback(() => {
    setLastSwapSuggestion(null);
    setLastSwapSuggestionMealType(null);
  }, []);

  const confirm = useCallback(async (mealType: MealType) => {
    if (!plan) return;

    const targetMeal = plan.meals.find((meal) => meal.mealType === mealType);
    if (!targetMeal) return;
    if (!targetMeal.topCombination) {
      setError('Bữa này chưa có tổ hợp món hợp lệ để xác nhận.');
      return;
    }
    if (!targetMeal.mealLogId) {
      setError('Bữa này chưa được lưu, hãy tạo lại thực đơn.');
      return;
    }

    setConfirmLoading(mealType);
    setError(null);

    try {
      await patchMealStatus(targetMeal.mealLogId, 'FOLLOWED');
      const nextPlan = updateMealStatusInPlan(plan, mealType, 'FOLLOWED');
      const nextStates = updateMealStatus(mealStates, mealType, 'eaten');
      persistPlan(nextPlan, nextStates);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Không thể xác nhận bữa ăn.');
    } finally {
      setConfirmLoading(null);
    }
  }, [mealStates, persistPlan, plan]);

  const skip = useCallback(async (mealType: MealType) => {
    if (!plan) return;

    const targetMeal = plan.meals.find((meal) => meal.mealType === mealType);
    if (!targetMeal?.mealLogId) {
      setError('Bữa này chưa được lưu, hãy tạo lại thực đơn.');
      return;
    }

    setConfirmLoading(mealType);
    setError(null);

    try {
      await patchMealStatus(targetMeal.mealLogId, 'SKIPPED');
      const nextPlan = updateMealStatusInPlan(plan, mealType, 'SKIPPED');
      const nextStates = updateMealStatus(mealStates, mealType, 'skipped');
      persistPlan(nextPlan, nextStates);
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : 'Không thể bỏ qua bữa ăn.');
    } finally {
      setConfirmLoading(null);
    }
  }, [mealStates, persistPlan, plan]);

  const toggleExpand = useCallback((mealType: MealType) => {
    if (!plan) return;
    const nextStates = mealStates.map((state) =>
      state.meal.mealType === mealType ? { ...state, expanded: !state.expanded } : state
    );
    persistPlan(plan, nextStates);
  }, [mealStates, persistPlan, plan]);

  const setDishFavorite = useCallback((dishId: string, favorite: boolean) => {
    if (!plan) return;

    const nextPlan = updateFavoriteInPlan(plan, dishId, favorite);
    const nextStates = mealStates.map((state) => {
      const updatedMeal = nextPlan.meals.find((meal) => meal.mealType === state.meal.mealType);
      return {
        ...state,
        meal: updatedMeal && hasRenderableCombination(updatedMeal) ? updatedMeal : state.meal,
      };
    });
    persistPlan(nextPlan, nextStates);
  }, [mealStates, persistPlan, plan]);

  const dismissScoreDropEvent = useCallback(() => {
    setScoreDropEvent(null);
    setSwapSnapshot(null);
  }, []);

  const revertSwap = useCallback(() => {
    if (!swapSnapshot) return;
    persistPlan(swapSnapshot.plan, swapSnapshot.mealStates);
    setScoreDropEvent(null);
    setLastSwapSuggestion(null);
    setLastSwapSuggestionMealType(null);
    setLastWarnings([]);
    setSwapSnapshot(null);
  }, [persistPlan, swapSnapshot]);

  return {
    plan,
    mealStates,
    loading,
    error,
    swapLoading,
    confirmLoading,
    scoreDropEvent,
    lastSwapSuggestion,
    lastSwapSuggestionMealType,
    lastWarnings,
    pinsByMeal,
    planDay,
    generate,
    swap,
    applyPin,
    unpin,
    dismissWarnings,
    dismissSuggestion,
    confirm,
    skip,
    toggleExpand,
    setDishFavorite,
    dismissScoreDropEvent,
    revertSwap,
  };
};
