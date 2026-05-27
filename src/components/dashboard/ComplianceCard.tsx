import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { MealLogHistoryItem, MealType, PlanType } from '../../services/mealLog.service';
import DashboardCard from './DashboardCard';

interface ComplianceCardProps {
  data: MealLogHistoryItem[];
  planType?: PlanType;
  error?: string;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MEAL_ORDER_3: MealType[] = ['SANG', 'TRUA', 'TOI'];
const MEAL_ORDER_5: MealType[] = ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];
const VALID_MEAL_TYPES = new Set<MealType>(MEAL_ORDER_5);

const MEAL_LABEL: Record<MealType, string> = {
  SANG: 'Sáng',
  PHU_SANG: 'Phụ sáng',
  TRUA: 'Trưa',
  PHU_CHIEU: 'Phụ chiều',
  TOI: 'Tối',
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = (today = new Date()): string[] => {
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return formatLocalDate(date);
  });
};

const isMealType = (value: string): value is MealType => {
  return VALID_MEAL_TYPES.has(value as MealType);
};

const groupByDate = (items: MealLogHistoryItem[]): Map<string, Set<MealType>> => {
  const map = new Map<string, Set<MealType>>();

  items.forEach((item) => {
    if (!isMealType(item.mealType)) return;

    const dateKey = item.mealDate.slice(0, 10);
    const meals = map.get(dateKey) ?? new Set<MealType>();
    meals.add(item.mealType);
    map.set(dateKey, meals);
  });

  return map;
};

const inferPlanType = (items: MealLogHistoryItem[]): PlanType => {
  return items.some((item) => item.planType === '5_BUA') ? '5_BUA' : '3_BUA';
};

const ComplianceCard: React.FC<ComplianceCardProps> = ({ data, planType, error }) => {
  const computed = useMemo(() => {
    const weekDates = getWeekDates();
    const grouped = groupByDate(data);
    const resolvedPlanType = planType ?? inferPlanType(data);
    const mealOrder = resolvedPlanType === '5_BUA' ? MEAL_ORDER_5 : MEAL_ORDER_3;
    const expectedPerDay = mealOrder.length;
    const totalExpected = weekDates.length * expectedPerDay;

    let totalLogged = 0;
    const dayMatrix = weekDates.map((date) => {
      const meals = grouped.get(date) ?? new Set<MealType>();
      const cells = mealOrder.map((meal) => meals.has(meal));
      const count = cells.filter(Boolean).length;
      totalLogged += count;

      return {
        date,
        cells,
        count,
        expected: expectedPerDay,
      };
    });

    return {
      dayMatrix,
      mealOrder,
      percent: totalExpected === 0 ? 0 : Math.round((totalLogged / totalExpected) * 100),
      resolvedPlanType,
      totalExpected,
      totalLogged,
    };
  }, [data, planType]);

  if (error) {
    return (
      <DashboardCard title="Đã có thực đơn · 7 ngày">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Đã có thực đơn · 7 ngày">
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <div className="text-3xl">🍽️</div>
          <div className="text-sm font-semibold text-gray-900">Chưa có thực đơn nào</div>
          <p className="max-w-xs text-xs leading-5 text-gray-500">
            Tạo thực đơn đầu tiên để bắt đầu theo dõi tiến độ trong tuần.
          </p>
          <Link
            to="/nutrition-plan"
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
          >
            Tạo thực đơn
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DashboardCard>
    );
  }

  const { dayMatrix, mealOrder, percent, resolvedPlanType, totalExpected, totalLogged } = computed;

  return (
    <DashboardCard
      title="Đã có thực đơn · 7 ngày"
      info={`Mỗi cột là 1 ngày trong tuần. Mỗi ô là 1 bữa (${
        resolvedPlanType === '5_BUA' ? '5 bữa/ngày' : '3 bữa/ngày'
      }).`}
      rightAction={
        <div className="text-right">
          <div
            className="text-lg font-bold text-gray-900"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {totalLogged}
            <span className="text-sm font-normal text-gray-400">/{totalExpected}</span>
            <span className="ml-1 text-xs font-medium text-gray-500">bữa</span>
          </div>
          <div className="text-xs font-semibold text-brand-green">{percent}%</div>
        </div>
      }
    >
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayMatrix.map((day, dayIndex) => {
          const dayFull = day.count === day.expected;

          return (
            <div key={day.date} className="flex flex-col items-center">
              <div
                className={`mb-2 text-[11px] font-semibold tracking-wide ${
                  dayFull ? 'text-brand-green-darker' : 'text-gray-400'
                }`}
              >
                {DAY_LABELS[dayIndex]}
              </div>
              <div className="flex w-full flex-col items-center gap-1">
                {mealOrder.map((meal, mealIndex) => {
                  const logged = day.cells[mealIndex];

                  return (
                    <div
                      key={meal}
                      title={`${MEAL_LABEL[meal]} ${DAY_LABELS[dayIndex]}: ${
                        logged ? 'đã có thực đơn' : 'chưa có'
                      }`}
                      className={`h-3.5 w-full max-w-7 rounded-sm transition-colors ${
                        logged
                          ? 'bg-brand-green'
                          : 'border border-dashed border-gray-200 bg-gray-50'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-green" />
          Có thực đơn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-gray-300 bg-gray-50" />
          Chưa có
        </span>
      </div>
    </DashboardCard>
  );
};

export default ComplianceCard;
