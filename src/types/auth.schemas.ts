import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự")
                     .max(20, "Username không được vượt quá 20 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Password phải có ít nhất 6 ký tự")
                     .max(40, "Password không được vượt quá 40 ký tự"),
  confirmPassword: z.string().min(6, "Confirm password phải có ít nhất 6 ký tự")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords không khớp",
  path: ["confirmPassword"], // Trường sẽ hiển thị lỗi
});

// Suy luận kiểu TypeScript từ Zod schema
export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  username: z.string().min(1, "Username không được để trống"), // Hoặc min(3) nếu bạn có quy tắc đó
  password: z.string().min(1, "Password không được để trống"), // Hoặc min(6)
});

export type LoginFormData = z.infer<typeof LoginSchema>;