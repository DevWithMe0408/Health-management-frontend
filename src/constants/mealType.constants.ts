import type { MealType } from '../types/meal.types';

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  SANG: 'Bữa sáng',
  PHU_SANG: 'Bữa phụ sáng',
  TRUA: 'Bữa trưa',
  PHU_CHIEU: 'Bữa phụ chiều',
  TOI: 'Bữa tối',
};

export const MEAL_TYPE_ICON: Record<MealType, string> = {
  SANG: '☀️',
  PHU_SANG: '🥪',
  TRUA: '🍽️',
  PHU_CHIEU: '☕',
  TOI: '🌙',
};

export const MEAL_TYPE_ICON_BG: Record<MealType, string> = {
  SANG: '#fef3c7',
  PHU_SANG: '#dcfce7',
  TRUA: '#fed7aa',
  PHU_CHIEU: '#fae8ff',
  TOI: '#e0e7ff',
};

export const THREE_MEAL_TYPES: MealType[] = ['SANG', 'TRUA', 'TOI'];

export const FIVE_MEAL_TYPES: MealType[] = [
  'SANG',
  'PHU_SANG',
  'TRUA',
  'PHU_CHIEU',
  'TOI',
];

