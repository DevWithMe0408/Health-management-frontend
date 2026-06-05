import { z } from 'zod';

const ACTIVITY_FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9] as const;

// Tao helper function de xu ly number input
const numberOrNull = (message: string, min?: number, max?: number) => {
  return z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .refine((val) => val === null || (typeof val === 'number' && val > 0), {
      message,
    })
    .refine((val) => val === null || min === undefined || val >= min, {
      message: `Giá trị phải >= ${min}`,
    })
    .refine((val) => val === null || max === undefined || val <= max, {
      message: `Giá trị phải <= ${max}`,
    });
};

export const SubmitHealthDataSchema = z.object({
  height: numberOrNull('Chiều cao phải là số dương', 100, 250).optional(),
  weight: numberOrNull('Cân nặng phải là số dương', 30, 300).optional(),
  abdomen: numberOrNull('Vòng bụng phải là số dương', 40, 200).optional(),
  hip: numberOrNull('Vòng hông phải là số dương', 50, 200).optional(),
  neck: numberOrNull('Vòng cổ phải là số dương', 20, 60).optional(),
  bust: numberOrNull('Vòng ngực phải là số dương', 50, 200).optional(),
  thigh: numberOrNull('Vòng đùi phải là số dương', 30, 120).optional(),
  activityFactor: numberOrNull('Hệ số vận động không hợp lệ')
    .refine((val) => val === null || ACTIVITY_FACTORS.some((factor) => factor === val), {
      message: 'Hệ số vận động không hợp lệ',
    })
    .optional(),
  BMINew: numberOrNull('BMI mới phải là số dương', 10, 60).optional(),
  BMRNew: numberOrNull('BMR mới phải là số dương', 500, 6000).optional(),
  TDEENew: numberOrNull('TDEE mới phải là số dương', 500, 6000).optional(),
  PBFNew: numberOrNull('PBF mới phải là số dương', 1, 70).optional(),
  WHRNew: numberOrNull('WHR mới phải là số dương', 0.5, 2).optional(),
});

export type SubmitHealthDataFormData = z.infer<typeof SubmitHealthDataSchema>;

export interface SubmitHealthApiRequest extends Partial<SubmitHealthDataFormData> {
  userId: string;
}
