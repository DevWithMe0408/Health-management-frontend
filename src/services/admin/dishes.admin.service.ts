import { apiClient } from '../axios';
import type { DataResponse } from '../apiResponse';

export type SlotCode = 'CHINH' | 'RAU' | 'TINH_BOT' | 'COMBO' | 'BUA_PHU';

// 12 nhom hop le cho mon an, khong gom GIA_VI.
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
  | 'BUA_PHU';

export interface DishAdmin {
  id: string;
  name: string;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  kcalPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
  baseServingG: number;
  unit: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface DishUpsertPayload {
  name: string;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  kcalPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
  baseServingG: number;
  unit: string;
  description?: string | null;
  isActive?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ListDishesParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  slotCode?: string;
  isActive?: boolean;
}

export const SLOT_OPTIONS: { value: SlotCode; label: string }[] = [
  { value: 'CHINH', label: 'Món chính' },
  { value: 'RAU', label: 'Rau' },
  { value: 'TINH_BOT', label: 'Tinh bột' },
  { value: 'COMBO', label: 'Combo' },
  { value: 'BUA_PHU', label: 'Bữa phụ' },
];

export const FOOD_GROUP_OPTIONS: { value: FoodGroup; label: string }[] = [
  { value: 'GIA_CAM', label: 'Gia cầm' },
  { value: 'THIT_DO', label: 'Thịt đỏ' },
  { value: 'CA', label: 'Cá' },
  { value: 'HAI_SAN', label: 'Hải sản' },
  { value: 'TRUNG', label: 'Trứng' },
  { value: 'DAU_DO', label: 'Đậu đỗ' },
  { value: 'RAU_LA', label: 'Rau lá' },
  { value: 'RAU_CU', label: 'Rau củ' },
  { value: 'TINH_BOT_GAO', label: 'Tinh bột (gạo)' },
  { value: 'TINH_BOT_MI', label: 'Tinh bột (mì)' },
  { value: 'COMBO', label: 'Combo' },
  { value: 'BUA_PHU', label: 'Bữa phụ' },
];

export const slotLabel = (code: string): string =>
  SLOT_OPTIONS.find((option) => option.value === code)?.label ?? code;

export const foodGroupLabel = (code: string): string =>
  FOOD_GROUP_OPTIONS.find((option) => option.value === code)?.label ?? code;

export const listDishes = async (
  params: ListDishesParams = {}
): Promise<PageResponse<DishAdmin>> => {
  const res = await apiClient.get<DataResponse<PageResponse<DishAdmin>>>(
    '/api/admin/dishes',
    { params: { page: 0, size: 10, ...params } }
  );
  return res.data.data;
};

export const getDish = async (id: string): Promise<DishAdmin> => {
  const res = await apiClient.get<DataResponse<DishAdmin>>(`/api/admin/dishes/${id}`);
  return res.data.data;
};

export const createDish = async (payload: DishUpsertPayload): Promise<DishAdmin> => {
  const res = await apiClient.post<DataResponse<DishAdmin>>('/api/admin/dishes', payload);
  return res.data.data;
};

export const updateDish = async (
  id: string,
  payload: DishUpsertPayload
): Promise<DishAdmin> => {
  const res = await apiClient.put<DataResponse<DishAdmin>>(
    `/api/admin/dishes/${id}`,
    payload
  );
  return res.data.data;
};

export const setDishActive = async (id: string, active: boolean): Promise<DishAdmin> => {
  const res = await apiClient.patch<DataResponse<DishAdmin>>(
    `/api/admin/dishes/${id}/active`,
    null,
    { params: { active } }
  );
  return res.data.data;
};
