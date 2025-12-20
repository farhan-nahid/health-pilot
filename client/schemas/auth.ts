import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  userType: z.enum(["patient", "doctor"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  key: z.string().min(1, "Verification key is required"),
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password1: z.string().min(6, "New password must be at least 6 characters"),
  new_password2: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.new_password1 === data.new_password2, {
  message: "New passwords don't match",
  path: ["new_password2"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
