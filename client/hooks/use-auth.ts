"use client";

import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import {
  ChangePasswordValues,
  ForgotPasswordValues,
  LoginValues,
  RegisterValues,
  ResetPasswordValues,
  VerifyEmailValues,
} from "@/schemas/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const { data } = await api.post("/auth/login/", values);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.key);
      queryClient.setQueryData(["user"], data.user);
      showSuccess("Welcome back! Successfully logged in.");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      const payload = {
        email: values.email,
        password1: values.password,
        password2: values.password,
        user_type: values.userType,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
      };
      const { data } = await api.post("/auth/registration/", payload);
      return data;
    },
    onSuccess: (data) => {
      showSuccess("Account created successfully!");
      if (data.key) {
        localStorage.setItem("token", data.key);
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/auth/login?message=check-email");
      }
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout/");
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.clear();
      showSuccess("Logged out successfully.");
      router.push("/auth/login");
      router.refresh();
    },
    onError: (error: any) => {
      localStorage.removeItem("token");
      queryClient.clear();
      router.push("/auth/login");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      await api.post("/auth/password/reset/", values);
    },
    onSuccess: () => {
      showSuccess("Password reset email sent. Please check your inbox.");
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const resetPasswordConfirmMutation = useMutation({
    mutationFn: async (payload: ResetPasswordValues & { uid: string; token: string }) => {
      await api.post("/auth/password/reset/confirm/", {
        uid: payload.uid,
        token: payload.token,
        new_password1: payload.password,
        new_password2: payload.confirmPassword,
      });
    },
    onSuccess: () => {
      showSuccess("Password reset successfully. You can now login.");
      router.push("/auth/login");
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (values: VerifyEmailValues) => {
      await api.post("/auth/registration/verify-email/", values);
    },
    onSuccess: () => {
      showSuccess("Email verified successfully!");
      router.push("/auth/login");
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: async (values: { email: string }) => {
      await api.post("/auth/registration/resend-email/", values);
    },
    onSuccess: () => {
      showSuccess("Verification email resent.");
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      await api.post("/auth/password/change/", values);
    },
    onSuccess: () => {
      showSuccess("Password changed successfully.");
    },
    onError: (error: any) => {
      showError(error);
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPasswordConfirm: resetPasswordConfirmMutation,
    verifyEmail: verifyEmailMutation,
    resendEmail: resendEmailMutation,
    changePassword: changePasswordMutation,
  };
}
