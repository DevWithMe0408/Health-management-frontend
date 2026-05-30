import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  confirmMeal,
  recommendFullDay,
  swapDish,
} from '../services/meal.service';
import { useAuth } from '../contexts/AuthContext';
import type { NutritionPreferences } from './useMealPreferences';
import type { NutritionUserContextData } from './useUserContext';
import type {
  DailyPlanResponse,
  DishSuggestionResponse,
  MealType,
  PinnedDish,
  SwapResultResponse,
  SwapSuggestion,
  UIMealState,
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
  skip: (mealType: MealType) => void;
  toggleExpand: (mealType: MealType) => void;
  setDishFavorite: (dishId: string, favorite: boolean) => void;
  dismissScoreDropEvent: () => void;
  revertSwap: () => void;
}

interface GenerateMealPlanOptions {
  forceCompute?: boolean;
  constitutionConfirmed?: boolean;
}

const buildInitialMealStates = (plan: DailyPlanResponse): UIMealState[] => {
  return plan.meals.map((meal, index) => ({
    meal,
    status: 'suggested',
    expanded: index === 0,
  }));
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getCacheKey = (userId: string | null | undefined) => {
  return `nutrition-plan-${userId ?? 'anonymous'}-${getTodayKey()}`;
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
    topCombination: {
      ...meal.topCombination,
      dishes: meal.topCombination.dishes.map((dish) =>
        dish.dishId === dishId ? { ...dish, favorite } : dish
      ),
    },
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

  const cacheKey = useMemo(() => getCacheKey(user?.userId), [user?.userId]);

  useEffect(() => {
    if (!userContext || plan) return;

    const cached = readCachedMealPlan(cacheKey);
    if (!cached) return;
    if (cached.plan.goalCode !== userContext.goalCode) {
      sessionStorage.removeItem(cacheKey);
      return;
    }

    setPlan(cached.plan);
    setMealStates(cached.mealStates);
  }, [cacheKey, plan, userContext]);

  const persistPlan = useCallback((nextPlan: DailyPlanResponse, nextStates: UIMealState[]) => {
    setPlan(nextPlan);
    setMealStates(nextStates);
    writeCachedMealPlan(cacheKey, nextPlan, nextStates);
  }, [cacheKey]);

  const generate = useCallback(async (options: GenerateMealPlanOptions = {}) => {
    if (!userContext || !preferences) return null;

    setLoading(true);
    setError(null);
    setScoreDropEvent(null);
    setLastSwapSuggestion(null);
    setLastSwapSuggestionMealType(null);
    setLastWarnings([]);
    setPinsByMeal(new Map());
    setSwapSnapshot(null);

    try {
      const nextPlan = await recommendFullDay({
        tdee: userContext.tdee,
        goalCode: userContext.goalCode,
        planType: preferences.planType,
        constitution: userContext.constitution,
        constitutionConfirmed: options.constitutionConfirmed ?? false,
        perMealConfig: preferences.perMealConfig,
        forceCompute: options.forceCompute ?? false,
      });
      const nextStates = buildInitialMealStates(nextPlan);
      persistPlan(nextPlan, nextStates);
      return nextPlan;
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Không thể tạo thực đơn.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistPlan, preferences, userContext]);

  const swap = useCallback(async (
    mealType: MealType,
    swappedSlot: string,
    newDishId: string
  ) => {
    if (!plan) return null;

    const targetMeal = plan.meals.find((meal) => meal.mealType === mealType);
    if (!targetMeal) return null;

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

    setConfirmLoading(mealType);
    setError(null);

    try {
      await confirmMeal({
        mealDate: plan.planDate,
        mealType,
        planType: plan.planType,
        goalCode: plan.goalCode,
        mealKcalTarget: targetMeal.mealKcalTarget,
        selectedCombination: targetMeal.topCombination,
      });

      const nextStates = updateMealStatus(mealStates, mealType, 'eaten');
      persistPlan(plan, nextStates);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Không thể xác nhận bữa ăn.');
    } finally {
      setConfirmLoading(null);
    }
  }, [mealStates, persistPlan, plan]);

  const skip = useCallback((mealType: MealType) => {
    if (!plan) return;
    const nextStates = updateMealStatus(mealStates, mealType, 'skipped');
    persistPlan(plan, nextStates);
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
    const nextStates = mealStates.map((state) => ({
      ...state,
      meal: nextPlan.meals.find((meal) => meal.mealType === state.meal.mealType) ?? state.meal,
    }));
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
