import React, { useEffect, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/admin/Modal';
import NumericInput from '../../components/admin/NumericInput';
import { toast } from '../../components/admin/Toast';
import { getApiErrorMessage } from '../../services/apiResponse';
import {
  createDish,
  updateDish,
  FOOD_GROUP_OPTIONS,
  SLOT_OPTIONS,
  type DishAdmin,
  type DishUpsertPayload,
  type FoodGroup,
  type SlotCode,
} from '../../services/admin/dishes.admin.service';

interface DishFormModalProps {
  open: boolean;
  initial: DishAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  slotCode: SlotCode | '';
  foodGroupCode: FoodGroup | '';
  kcalPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
  baseServingG: number;
  unit: string;
  description: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  slotCode: '',
  foodGroupCode: '',
  kcalPer100g: 0,
  proteinPer100g: 0,
  fatPer100g: 0,
  carbPer100g: 0,
  baseServingG: 100,
  unit: 'phần',
  description: '',
  isActive: true,
};

const DishFormModal: React.FC<DishFormModalProps> = ({
  open,
  initial,
  onClose,
  onSaved,
}) => {
  const isEdit = initial != null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        name: initial.name,
        slotCode: initial.slotCode,
        foodGroupCode: initial.foodGroupCode,
        kcalPer100g: initial.kcalPer100g,
        proteinPer100g: initial.proteinPer100g,
        fatPer100g: initial.fatPer100g,
        carbPer100g: initial.carbPer100g,
        baseServingG: initial.baseServingG,
        unit: initial.unit,
        description: initial.description ?? '',
        isActive: initial.isActive,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
    setSaving(false);
  }, [open, initial]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const trimmedName = form.name.trim();
    const trimmedUnit = form.unit.trim();

    if (!trimmedName) {
      nextErrors.name = 'Bắt buộc nhập tên món';
    } else if (trimmedName.length > 100) {
      nextErrors.name = 'Tối đa 100 ký tự';
    }

    if (!form.slotCode) nextErrors.slotCode = 'Chọn slot';
    if (!form.foodGroupCode) nextErrors.foodGroupCode = 'Chọn nhóm thực phẩm';

    if (!trimmedUnit) {
      nextErrors.unit = 'Bắt buộc nhập đơn vị';
    } else if (trimmedUnit.length > 20) {
      nextErrors.unit = 'Tối đa 20 ký tự';
    }

    if (!Number.isFinite(form.baseServingG) || form.baseServingG < 1) {
      nextErrors.baseServingG = 'Phải >= 1';
    }

    (['kcalPer100g', 'proteinPer100g', 'fatPer100g', 'carbPer100g'] as const).forEach(
      (key) => {
        if (!Number.isFinite(form[key]) || form[key] < 0) {
          nextErrors[key] = 'Phải >= 0';
        }
      }
    );

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: DishUpsertPayload = {
      name: form.name.trim(),
      slotCode: form.slotCode as SlotCode,
      foodGroupCode: form.foodGroupCode as FoodGroup,
      kcalPer100g: form.kcalPer100g,
      proteinPer100g: form.proteinPer100g,
      fatPer100g: form.fatPer100g,
      carbPer100g: form.carbPer100g,
      baseServingG: form.baseServingG,
      unit: form.unit.trim(),
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (isEdit && initial) {
        await updateDish(initial.id, payload);
        toast.success('Đã cập nhật món ăn');
      } else {
        await createDish(payload);
        toast.success('Đã thêm món ăn');
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Lưu món ăn thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const inputClassName = (error?: string) =>
    `w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent ${
      error ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        disabled={saving}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-brand-green-dark disabled:opacity-50"
      >
        {saving ? 'Đang lưu...' : 'Lưu món'}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa món ăn' : 'Thêm món ăn mới'}
      onClose={handleClose}
      footer={footer}
    >
      <div className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              className={inputClassName(errors.name)}
              placeholder="Vd: Thịt kho tàu"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slot</label>
              <select
                value={form.slotCode}
                onChange={(event) => setField('slotCode', event.target.value as SlotCode | '')}
                className={inputClassName(errors.slotCode)}
              >
                <option value="">Chọn slot</option>
                {SLOT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.slotCode && <p className="mt-1 text-xs text-red-600">{errors.slotCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm thực phẩm
              </label>
              <select
                value={form.foodGroupCode}
                onChange={(event) =>
                  setField('foodGroupCode', event.target.value as FoodGroup | '')
                }
                className={inputClassName(errors.foodGroupCode)}
              >
                <option value="">Chọn nhóm</option>
                {FOOD_GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.foodGroupCode && (
                <p className="mt-1 text-xs text-red-600">{errors.foodGroupCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị khẩu phần
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(event) => setField('unit', event.target.value)}
                className={inputClassName(errors.unit)}
                placeholder="Vd: bát, đĩa, tô..."
              />
              {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
            </div>

            <NumericInput
              label="Gram / khẩu phần"
              value={form.baseServingG}
              onChange={(value) => setField('baseServingG', value)}
              min={1}
              max={5000}
              step={1}
              unit="g"
              error={errors.baseServingG}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Giá trị dinh dưỡng{' '}
            <span className="font-normal text-gray-400">(trên 100g)</span>
          </h3>
          <div className="flex flex-wrap gap-5 mt-3">
            <NumericInput
              label="Kcal"
              value={form.kcalPer100g}
              onChange={(value) => setField('kcalPer100g', value)}
              min={0}
              step={1}
              unit="kcal"
              error={errors.kcalPer100g}
            />
            <NumericInput
              label="Protein"
              value={form.proteinPer100g}
              onChange={(value) => setField('proteinPer100g', value)}
              min={0}
              step={0.1}
              unit="g"
              error={errors.proteinPer100g}
            />
            <NumericInput
              label="Fat"
              value={form.fatPer100g}
              onChange={(value) => setField('fatPer100g', value)}
              min={0}
              step={0.1}
              unit="g"
              error={errors.fatPer100g}
            />
            <NumericInput
              label="Carb"
              value={form.carbPer100g}
              onChange={(value) => setField('carbPer100g', value)}
              min={0}
              step={0.1}
              unit="g"
              error={errors.carbPer100g}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            rows={3}
            maxLength={1000}
            className={inputClassName()}
            placeholder="Mô tả ngắn về món ăn"
          />
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh món</label>
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-md cursor-not-allowed"
          >
            <PhotoIcon className="h-5 w-5" />
            Tải ảnh lên
          </button>
          <p className="mt-1 text-xs text-gray-400">Tính năng ảnh sẽ được bổ sung sau.</p>
        </div>

        {isEdit && (
          <div className="border-t border-gray-100 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Trạng thái</p>
              <p className="text-xs text-gray-500">
                Bật để món xuất hiện trong thuật toán đề xuất.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setField('isActive', event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              Đang hoạt động
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DishFormModal;
