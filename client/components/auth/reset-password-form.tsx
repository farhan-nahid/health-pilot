"use client";

import { FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { resetPasswordSchema, ResetPasswordValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

export function ResetPasswordForm() {
  const { resetPasswordConfirm } = useAuth();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    resetPasswordConfirm.mutate({
      ...values,
      uid,
      token,
    });
  };

  if (!uid || !token) {
    return (
      <Card className="border-none shadow-none bg-transparent text-center">
        <CardHeader className="px-0">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-0 pt-6">
          <Button asChild className="w-full">
            <a href="/auth/forgot-password">Request new link</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6 px-0 text-center">
        <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
        <CardDescription>
          Choose a strong password to protect your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-0">
          <FormPasswordInput
            control={form.control}
            name="password"
            label="New Password"
          />
          <FormPasswordInput
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
          />
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button
            type="submit"
            className="w-full"
            loading={resetPasswordConfirm.isPending}
          >
            Reset password
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
