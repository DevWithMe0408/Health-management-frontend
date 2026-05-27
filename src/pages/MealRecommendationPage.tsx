import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FooterSummary from '../components/meal/FooterSummary';
import InfoStrip from '../components/meal/InfoStrip';
import MealCard from '../components/meal/MealCard';
import SetupWizard from '../components/meal/SetupWizard';
import SwapDrawer from '../components/meal/SwapDrawer';
import ScoreDropBanner from '../components/meal/banners/ScoreDropBanner';
import WarningGoalModal from '../components/meal/banners/WarningGoalModal';
import MealPlanEmptyState from '../components/states/MealPlanEmptyState';
import MealPlanLoadingSkeleton from '../components/states/MealPlanLoadingSkeleton';
import { CONSTITUTION_LABEL, GOAL_LABEL } from '../constants/goal.constants';
import { useMealPlan } from '../hooks/useMealPlan';
import { useMealPreferences } from '../hooks/useMealPreferences';
import { useUserContext } from '../hooks/useUserContext';
import { addFavoriteDish, removeFavoriteDish } from '../services/meal.service';
import type {
  DishOptionResponse,
  DishSuggestionResponse,
  MealType,
  UIMealState,
} from '../types/meal.types';

interface SwapDrawerState {
  open: boolean;
  mealType: MealType | null;
  slotKey: string | null;
  currentDish: DishSuggestionResponse | null;
}

interface DayMacroSummary {
  totals: {
    kcal: number;
    p: number;
    f: number;
    c: number;
  };
  targets: {
    kcal: number;
    p: number;
    f: number;
    c: number;
  };
  overallScore: number;
}

const EMPTY_SWAP_DRAWER_STATE: SwapDrawerState = {
  open: false,
  mealType: null,
  slotKey: null,
  currentDish: null,
};

const formatVietnameseDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const roundMacro = (value: number) => Number(value.toFixed(1));

const computeDaySummary = (mealStates: UIMealState[]): DayMacroSummary => {
  const initialSummary: DayMacroSummary = {
    totals: { kcal: 0, p: 0, f: 0, c: 0 },
    targets: { kcal: 0, p: 0, f: 0, c: 0 },
    overallScore: 0,
  };

  if (mealStates.length === 0) return initialSummary;

  const summary = mealStates.reduce((current, state) => {
    const combination = state.meal.topCombination;

    return {
      totals: {
        kcal: current.totals.kcal + combination.totalKcal,
        p: current.totals.p + combination.totalProtein,
        f: current.totals.f + combination.totalFat,
        c: current.totals.c + combination.totalCarb,
      },
      targets: {
        kcal: current.targets.kcal + state.meal.mealKcalTarget,
        p: current.targets.p + state.meal.proteinTarget,
        f: current.targets.f + state.meal.fatTarget,
        c: current.targets.c + state.meal.carbTarget,
      },
      overallScore: current.overallScore + combination.finalScore,
    };
  }, initialSummary);

  return {
    totals: {
      kcal: roundMacro(summary.totals.kcal),
      p: roundMacro(summary.totals.p),
      f: roundMacro(summary.totals.f),
      c: roundMacro(summary.totals.c),
    },
    targets: {
      kcal: roundMacro(summary.targets.kcal),
      p: roundMacro(summary.targets.p),
      f: roundMacro(summary.targets.f),
      c: roundMacro(summary.targets.c),
    },
    overallScore: roundMacro(summary.overallScore / mealStates.length),
  };
};

const findMealState = (mealStates: UIMealState[], mealType: MealType | null) => {
  return mealStates.find((state) => state.meal.mealType === mealType) ?? null;
};

const getAlternativesForSlot = (
  mealStates: UIMealState[],
  mealType: MealType | null,
  slotKey: string | null
): DishOptionResponse[] => {
  if (!mealType || !slotKey) return [];
  const mealState = findMealState(mealStates, mealType);
  return mealState?.meal.slotAlternatives[slotKey] ?? [];
};

const MealRecommendationPage = () => {
  const navigate = useNavigate();
  const userContext = useUserContext();
  const preferences = useMealPreferences();
  const mealPlan = useMealPlan({
    userContext: userContext.data,
    preferences: preferences.preferences,
  });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const autoGenerateAttempted = useRef(false);
  const [swapDrawerState, setSwapDrawerState] = useState<SwapDrawerState>(
    EMPTY_SWAP_DRAWER_STATE
  );
  const todayLabel = useMemo(() => formatVietnameseDate(new Date()), []);
  const daySummary = useMemo(
    () => computeDaySummary(mealPlan.mealStates),
    [mealPlan.mealStates]
  );

  useEffect(() => {
    if (!preferences.loading && preferences.isFirstTime) {
      setWizardOpen(true);
    }
  }, [preferences.isFirstTime, preferences.loading]);

  useEffect(() => {
    if (userContext.data?.warning) {
      setWarningModalOpen(true);
    }
  }, [userContext.data?.warning]);

  useEffect(() => {
    autoGenerateAttempted.current = false;
  }, [
    preferences.preferences?.planType,
    userContext.data?.goalCode,
    userContext.data?.tdee,
  ]);

  useEffect(() => {
    if (autoGenerateAttempted.current) return;

    if (
      userContext.data &&
      preferences.preferences &&
      !preferences.isFirstTime &&
      !mealPlan.plan &&
      !mealPlan.loading
    ) {
      autoGenerateAttempted.current = true;
      void mealPlan.generate();
    }
  }, [
    mealPlan.generate,
    mealPlan.loading,
    mealPlan.plan,
    preferences.isFirstTime,
    preferences.preferences,
    userContext.data,
  ]);

  const closeSwapDrawer = () => {
    setSwapDrawerState(EMPTY_SWAP_DRAWER_STATE);
  };

  const handleToggleFavorite = async (dishId: string, currentFavorite: boolean) => {
    const nextFavorite = !currentFavorite;
    mealPlan.setDishFavorite(dishId, nextFavorite);

    try {
      if (nextFavorite) {
        await addFavoriteDish(dishId);
        toast.success('Đã thêm món yêu thích.');
      } else {
        await removeFavoriteDish(dishId);
        toast.success('Đã bỏ món yêu thích.');
      }
    } catch (error) {
      mealPlan.setDishFavorite(dishId, currentFavorite);
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật món yêu thích.');
    }
  };

  const handleWizardComplete = async (nextPreferences: Parameters<typeof preferences.savePreferences>[0]) => {
    await preferences.savePreferences(nextPreferences);
    autoGenerateAttempted.current = false;
    setWizardOpen(false);
  };

  const selectedMealState = findMealState(mealPlan.mealStates, swapDrawerState.mealType);
  const alternatives = getAlternativesForSlot(
    mealPlan.mealStates,
    swapDrawerState.mealType,
    swapDrawerState.slotKey
  );

  if (userContext.loading || preferences.loading || (mealPlan.loading && !mealPlan.plan)) {
    return <MealPlanLoadingSkeleton />;
  }

  if (userContext.emptyHealthData) {
    return <MealPlanEmptyState />;
  }

  if (userContext.error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
        <h2 className="text-lg font-bold">Không thể tải dữ liệu thực đơn</h2>
        <p className="mt-2 text-sm">{userContext.error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đề xuất thực đơn</h1>
          <p className="mt-1 text-sm text-gray-500">
            Thực đơn cá nhân hóa theo mục tiêu, TDEE và thể trạng hiện tại.
          </p>
        </div>
      </div>

      {userContext.data && (
        <InfoStrip
          goal={userContext.data.goalCode}
          goalLabel={GOAL_LABEL[userContext.data.goalCode]}
          tdee={userContext.data.tdee}
          constitutionLabel={CONSTITUTION_LABEL[userContext.data.constitution]}
          date={todayLabel}
          onChangeGoal={() => navigate('/profile')}
          onRegen={() => void mealPlan.generate({ forceCompute: true })}
          regenLoading={mealPlan.loading}
        />
      )}

      {(mealPlan.error || preferences.error) && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mealPlan.error ?? preferences.error}
        </div>
      )}

      {mealPlan.scoreDropEvent && (
        <div className="mb-4">
          <ScoreDropBanner
            from={mealPlan.scoreDropEvent.from}
            to={mealPlan.scoreDropEvent.to}
            onKeep={mealPlan.dismissScoreDropEvent}
            onRevert={mealPlan.revertSwap}
          />
        </div>
      )}

      {mealPlan.mealStates.length === 0 && !wizardOpen ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Chưa có thực đơn. Hãy hoàn tất thiết lập hoặc gen lại cả ngày.
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-4">
          {mealPlan.mealStates.map(({ meal, status, expanded }) => (
            <MealCard
              key={meal.mealType}
              meal={meal}
              status={status}
              expanded={expanded}
              score={meal.topCombination.finalScore}
              confirmLoading={mealPlan.confirmLoading === meal.mealType}
              onToggleExpand={() => mealPlan.toggleExpand(meal.mealType)}
              onSwapClick={(slotKey, currentDish) =>
                setSwapDrawerState({
                  open: true,
                  mealType: meal.mealType,
                  slotKey,
                  currentDish,
                })
              }
              onConfirm={() => void mealPlan.confirm(meal.mealType)}
              onSkip={() => mealPlan.skip(meal.mealType)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {mealPlan.mealStates.length > 0 && (
        <FooterSummary
          totals={daySummary.totals}
          targets={daySummary.targets}
          overallScore={daySummary.overallScore}
        />
      )}

      <SetupWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      <WarningGoalModal
        open={warningModalOpen}
        warning={userContext.data?.warning}
        currentBMI={userContext.data?.bmi ?? null}
        onChangeGoal={() => navigate('/profile')}
        onContinue={() => setWarningModalOpen(false)}
      />

      {swapDrawerState.open && swapDrawerState.currentDish && selectedMealState && (
        <SwapDrawer
          open={swapDrawerState.open}
          currentDish={swapDrawerState.currentDish}
          currentMealScore={selectedMealState.meal.topCombination.finalScore}
          alternatives={alternatives}
          suggestion={mealPlan.lastSwapSuggestion}
          confirmLoading={mealPlan.swapLoading}
          onClose={closeSwapDrawer}
          onConfirm={async (newDishId) => {
            if (!swapDrawerState.mealType || !swapDrawerState.slotKey) return;
            await mealPlan.swap(swapDrawerState.mealType, swapDrawerState.slotKey, newDishId);
            closeSwapDrawer();
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default MealRecommendationPage;
