import { z } from 'zod';

// Tạo helper function để xử lý number input
const numberOrNull = (message: string, min?: number, max?: number) => {
  return z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .refine((val) => val === null || (typeof val === 'number' && val > 0), {
      message: message
    })
    .refine((val) => val === null || !min || val >= min, {
      message: `Giá trị phải >= ${min}`
    })
    .refine((val) => val === null || !max || val <= max, {
      message: `Giá trị phải <= ${max}`
    });
};

export const SubmitHealthDataSchema = z.object({
  height: numberOrNull("Chiều cao phải là số dương").optional(),
  weight: numberOrNull("Cân nặng phải là số dương").optional(),
  waist: numberOrNull("Vòng eo phải là số dương").optional(),
  hip: numberOrNull("Vòng hông phải là số dương").optional(),
  neck: numberOrNull("Vòng cổ phải là số dương").optional(),
  bust: numberOrNull("Vòng ngực phải là số dương").optional(),
  activityFactor: numberOrNull("Hệ số vận động không hợp lệ", 1.0, 2.5).optional(),
  BMINew: numberOrNull("BMI mới phải là số dương").optional(),
  BMRNew: numberOrNull("BMR mới phải là số dương").optional(),
  TDEENew: numberOrNull("TDEE mới phải là số dương").optional(),
  PBFNew: numberOrNull("PBF mới phải là số dương").optional(),
  WHRNew: numberOrNull("WHR mới phải là số dương").optional(),
});

export type SubmitHealthDataFormData = z.infer<typeof SubmitHealthDataSchema>;

export interface SubmitHealthApiRequest extends Partial<SubmitHealthDataFormData> {
  userId: string;
}