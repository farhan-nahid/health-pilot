"use client";

import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

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
      <Card className="border-none shadow-none bg-transparent text-center">
        <CardHeader className="px-0">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <strong>{form.getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-4">
          <p className="text-sm text-muted-foreground">
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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6 px-0 text-center">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
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
            <Link href="/auth/login" className="text-primary hover:underline font-medium inline-flex items-center">
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
