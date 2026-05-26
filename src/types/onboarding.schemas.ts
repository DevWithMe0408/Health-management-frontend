import { z } from 'zod';

export const computeAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
};

const requiredNumber = (message: string) =>
  z.number({ required_error: message, invalid_type_error: message });

const optionalNumber = () => z.number().nullable();

export const step2Schema = z.object({
  goalCode: z.enum(['GIAM', 'DUY_TRI', 'TANG'], {
    required_error: 'Vui lòng chọn mục tiêu',
  }),
});

export const step3Schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên quá dài, tối đa 100 ký tự'),
  birthDate: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((value) => {
      const age = computeAge(value);
      return age >= 13 && age <= 100;
    }, 'Tuổi phải từ 13 đến 100'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Vui lòng chọn giới tính',
  }),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^0\d{9,10}$/.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
});

export const step4Schema = z.object({
  heightCm: requiredNumber('Vui lòng nhập chiều cao')
    .min(100, 'Chiều cao tối thiểu 100cm')
    .max(250, 'Chiều cao tối đa 250cm'),
  weightKg: requiredNumber('Vui lòng nhập cân nặng')
    .min(30, 'Cân nặng tối thiểu 30kg')
    .max(300, 'Cân nặng tối đa 300kg'),
  activityFactor: requiredNumber('Vui lòng chọn mức vận động').refine(
    (value) => [1.2, 1.375, 1.55, 1.725, 1.9].includes(value),
    'Vui lòng chọn một mức vận động'
  ),
});

export const step5Schema = z.object({
  waistCm: optionalNumber().refine((value) => value === null || (value >= 40 && value <= 200), {
    message: 'Vòng eo không hợp lệ',
  }),
  hipCm: optionalNumber().refine((value) => value === null || (value >= 50 && value <= 200), {
    message: 'Vòng hông không hợp lệ',
  }),
  neckCm: optionalNumber().refine((value) => value === null || (value >= 20 && value <= 60), {
    message: 'Vòng cổ không hợp lệ',
  }),
  bustCm: optionalNumber().refine((value) => value === null || (value >= 50 && value <= 200), {
    message: 'Vòng ngực không hợp lệ',
  }),
});

export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
