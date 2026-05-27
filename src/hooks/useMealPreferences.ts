import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAllPreferences,
  updatePreference,
  type PreferenceResponse,
} from '../services/userPreferences.service';
import type { MealType, PerMealConfigMap, PerMealConfigRequest, PlanType } from '../types/meal.types';
import type { UserPreferenceKey } from '../types/refactorUi.types';

const NUTRITION_PLAN_TYPE_KEY: UserPreferenceKey = 'MEAL_PLAN_TYPE';

const MEAL_CONFIG_PREF_KEY: Record<MealType, UserPreferenceKey> = {
  SANG: 'BREAKFAST_CONFIG',
  PHU_SANG: 'SNACK_AM_CONFIG',
  TRUA: 'LUNCH_CONFIG',
  PHU_CHIEU: 'SNACK_PM_CONFIG',
  TOI: 'DINNER_CONFIG',
};

const DEFAULT_MEAL_CONFIG: Record<MealType, PerMealConfigRequest> = {
  SANG: { mealKind: 'COMBO' },
  PHU_SANG: { mealKind: 'COMBO' },
  TRUA: { mealKind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1 },
  PHU_CHIEU: { mealKind: 'COMBO' },
  TOI: { mealKind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1 },
};

export interface NutritionPreferences {
  planType: PlanType;
  perMealConfig: PerMealConfigMap;
}

interface UseMealPreferencesResult {
  preferences: NutritionPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isFirstTime: boolean;
  reload: () => Promise<void>;
  savePreferences: (nextPreferences: NutritionPreferences) => Promise<NutritionPreferences>;
}

const parsePlanType = (value: string | undefined): PlanType | null => {
  return value === '3_BUA' || value === '5_BUA' ? value : null;
};

const isMealConfig = (value: unknown): value is PerMealConfigRequest => {
  if (typeof value !== 'object' || value === null || !('mealKind' in value)) return false;
  const mealKind = (value as { mealKind: unknown }).mealKind;
  return mealKind === 'COMBO' || mealKind === 'NHIEU_MON';
};

const parseMealConfig = (value: string | undefined): PerMealConfigRequest | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    return isMealConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const indexPreferences = (preferences: PreferenceResponse[]) => {
  return new Map(preferences.map((preference) => [preference.prefKey, preference.prefValue]));
};

const buildNutritionPreferences = (
  storedPreferences: PreferenceResponse[]
): { preferences: NutritionPreferences | null; isFirstTime: boolean } => {
  const byKey = indexPreferences(storedPreferences);
  const planType = parsePlanType(byKey.get(NUTRITION_PLAN_TYPE_KEY));

  if (!planType) {
    return { preferences: null, isFirstTime: true };
  }

  const perMealConfig: PerMealConfigMap = {};
  Object.entries(MEAL_CONFIG_PREF_KEY).forEach(([mealType, prefKey]) => {
    const parsed = parseMealConfig(byKey.get(prefKey));
    if (parsed) perMealConfig[mealType as MealType] = parsed;
  });

  const mealTypes: MealType[] =
    planType === '3_BUA'
      ? ['SANG', 'TRUA', 'TOI']
      : ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];

  mealTypes.forEach((mealType) => {
    perMealConfig[mealType] = perMealConfig[mealType] ?? DEFAULT_MEAL_CONFIG[mealType];
  });

  return {
    preferences: { planType, perMealConfig },
    isFirstTime: false,
  };
};

export const useMealPreferences = (): UseMealPreferencesResult => {
  const [storedPreferences, setStoredPreferences] = useState<PreferenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setStoredPreferences(await getAllPreferences());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải tùy chọn thực đơn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const derived = useMemo(() => buildNutritionPreferences(storedPreferences), [storedPreferences]);

  const savePreferences = useCallback(async (nextPreferences: NutritionPreferences) => {
    setSaving(true);
    setError(null);

    try {
      await updatePreference(NUTRITION_PLAN_TYPE_KEY, {
        prefValue: nextPreferences.planType,
        valueType: 'STRING',
      });

      const entries = Object.entries(nextPreferences.perMealConfig) as Array<
        [MealType, PerMealConfigRequest]
      >;

      await Promise.all(
        entries.map(([mealType, config]) =>
          updatePreference(MEAL_CONFIG_PREF_KEY[mealType], {
            prefValue: JSON.stringify(config),
            valueType: 'JSON',
          })
        )
      );

      await loadPreferences();
      return nextPreferences;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu tùy chọn thực đơn.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [loadPreferences]);

  return {
    preferences: derived.preferences,
    loading,
    saving,
    error,
    isFirstTime: derived.isFirstTime,
    reload: loadPreferences,
    savePreferences,
  };
};

