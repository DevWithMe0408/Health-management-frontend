import type { FoodGroup } from '../types/meal.types';

export const FOOD_GROUP_LABEL: Record<FoodGroup, string> = {
  GIA_CAM: 'Gia cầm',
  THIT_DO: 'Thịt đỏ',
  CA: 'Cá',
  HAI_SAN: 'Hải sản',
  TRUNG: 'Trứng',
  DAU_DO: 'Đậu đỗ',
  RAU_LA: 'Rau lá',
  RAU_CU: 'Rau củ',
  TINH_BOT_GAO: 'Tinh bột gạo',
  TINH_BOT_MI: 'Tinh bột mì',
  COMBO: 'Combo',
  BUA_PHU: 'Bữa phụ',
  GIA_VI: 'Gia vị',
};

export const FOOD_GROUP_PALETTE: Record<FoodGroup, [string, string]> = {
  GIA_CAM: ['#fde68a', '#f59e0b'],
  THIT_DO: ['#fecaca', '#dc2626'],
  CA: ['#bae6fd', '#0284c7'],
  HAI_SAN: ['#c7d2fe', '#4f46e5'],
  TRUNG: ['#fef9c3', '#ca8a04'],
  DAU_DO: ['#ddd6fe', '#7c3aed'],
  RAU_LA: ['#bbf7d0', '#059669'],
  RAU_CU: ['#d9f99d', '#65a30d'],
  TINH_BOT_GAO: ['#fef3c7', '#d97706'],
  TINH_BOT_MI: ['#ffedd5', '#ea580c'],
  COMBO: ['#fed7aa', '#ea580c'],
  BUA_PHU: ['#fbcfe8', '#db2777'],
  GIA_VI: ['#e5e7eb', '#6b7280'],
};

