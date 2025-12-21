"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { type ResetPasswordValues, resetPasswordSchema } from "@/schemas/auth";

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
      <Card className="border-none bg-transparent text-center shadow-none">
        <CardHeader className="px-0">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="font-bold text-2xl">Invalid Reset Link</CardTitle>
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
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="font-bold text-2xl">Set new password</CardTitle>
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
