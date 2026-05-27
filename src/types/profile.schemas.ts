import { z } from 'zod';

export function computeAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

export const personalInfoSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên tối đa 100 ký tự'),
  birthDate: z.string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((value) => {
      const age = computeAge(value);
      return age >= 13 && age <= 100;
    }, 'Tuổi phải từ 13 đến 100'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Vui lòng chọn giới tính',
  }),
  phone: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || /^0\d{9,10}$/.test(value),
      'Số điện thoại không hợp lệ (VD: 0912345678)',
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ HOA')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  path: ['newPassword'],
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
