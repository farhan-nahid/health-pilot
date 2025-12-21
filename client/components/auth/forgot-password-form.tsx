"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form";
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
import { type ForgotPasswordValues, forgotPasswordSchema } from "@/schemas/auth";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    forgotPassword.mutate(values);
  };

  if (forgotPassword.isSuccess) {
    return (
      <Card className="border-none bg-transparent text-center shadow-none">
        <CardHeader className="px-0">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-bold text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <strong>{form.getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-4">
          <p className="text-muted-foreground text-sm">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => forgotPassword.reset()}
          >
            Try another email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="font-bold text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-0">
          <FormInput
            control={form.control}
            name="email"
            label="Email address"
            placeholder="name@example.com"
          />
          <div className="text-center text-sm">
            <Link
              href="/login"
              className="inline-flex items-center font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button type="submit" className="w-full" loading={forgotPassword.isPending}>
            Send reset link
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
