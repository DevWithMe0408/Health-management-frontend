import type { DishLite, MealLogRecord, MealType } from './nutritionHistory.types';
import { MEAL_ORDER } from './nutritionHistory.constants';
import { fmtKey, isSameDay } from './nutritionHistory.utils';

/**
 * MOCK DATA — sinh đủ một tháng để render cả 3 chế độ Ngày/Tuần/Tháng.
 * Khi tích hợp: thay buildMockMonth() bằng dữ liệu API
 * (GET /api/meal-log/history → MealLogRecord[]).
 */

// "Hôm nay" cố định để design render ổn định. Thực tế dùng new Date().
export const MOCK_TODAY = new Date(2026, 5, 10);

const MEAL_PLAN: Record<MealType, DishLite[]> = {
  SANG: [
    { dishName: 'Phở gà', dishKcal: 380 },
    { dishName: 'Trứng luộc', dishKcal: 70 },
  ],
  PHU_SANG: [
    { dishName: 'Sữa chua Hy Lạp', dishKcal: 120 },
    { dishName: 'Chuối', dishKcal: 90 },
  ],
  TRUA: [
    { dishName: 'Cơm gạo lứt', dishKcal: 280 },
    { dishName: 'Ức gà áp chảo', dishKcal: 220 },
    { dishName: 'Canh rau ngót', dishKcal: 60 },
  ],
  PHU_CHIEU: [
    { dishName: 'Sữa hạt', dishKcal: 140 },
    { dishName: 'Hạt điều', dishKcal: 110 },
  ],
  TOI: [
    { dishName: 'Cơm trắng', dishKcal: 250 },
    { dishName: 'Cá hồi áp chảo', dishKcal: 240 },
    { dishName: 'Rau cải luộc', dishKcal: 45 },
  ],
};

const CUSTOM_NOTES = [
  'Đi ăn ngoài với đồng nghiệp — cơm gà xối mỡ',
  'Bún bò Huế gần nhà',
  'Bánh mì thịt + cà phê sữa',
  'Lẩu thái cuối tuần',
  'Cơm tấm sườn bì',
];
const CUSTOM_KCAL = [620, 540, 480, 780, 700];

export function buildMockMonth(year: number, month: number, today = MOCK_TODAY): MealLogRecord[] {
  let seed = year * 100 + month + 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const logs: MealLogRecord[] = [];
  const days = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const key = fmtKey(date);
    const future = date > today;
    const isToday = isSameDay(date, today);

    MEAL_ORDER.forEach((mealType, idx) => {
      const plan = MEAL_PLAN[mealType];
      let status: MealLogRecord['status'];

      if (future) {
        status = 'SUGGESTED';
      } else if (isToday) {
        status = idx <= 2 ? (idx === 1 ? 'CUSTOM' : 'FOLLOWED') : 'SUGGESTED';
      } else {
        const r = rand();
        status = r < 0.6 ? 'FOLLOWED' : r < 0.82 ? 'CUSTOM' : r < 0.93 ? 'SKIPPED' : 'SUGGESTED';
      }

      let dishes: DishLite[] = [];
      let customNote: string | null = null;
      let totalKcalActual = 0;

      if (status === 'FOLLOWED') {
        dishes = plan.map((x) => ({ ...x }));
        totalKcalActual = dishes.reduce((s, x) => s + x.dishKcal, 0);
      } else if (status === 'CUSTOM') {
        const ni = Math.floor(rand() * CUSTOM_NOTES.length);
        customNote = CUSTOM_NOTES[ni];
        totalKcalActual = CUSTOM_KCAL[ni];
      } else if (status === 'SUGGESTED') {
        dishes = plan.map((x) => ({ ...x }));
      }

      logs.push({ id: `${key}-${mealType}`, mealDate: key, mealType, status, customNote, totalKcalActual, dishes });
    });
  }
  return logs;
}

export const MOCK_LOGS: MealLogRecord[] = buildMockMonth(
  MOCK_TODAY.getFullYear(),
  MOCK_TODAY.getMonth()
);

// Suy ra thực đơn đề xuất cho một bữa (hiển thị mờ khi SUGGESTED).
export const getSuggestedDishes = (mealType: MealType): DishLite[] =>
  MEAL_PLAN[mealType].map((x) => ({ ...x }));
