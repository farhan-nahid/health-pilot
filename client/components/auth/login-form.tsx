"use client";

import { FormInput, FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { loginSchema, LoginValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login/", values);
      localStorage.setItem("token", data.key);
      showSuccess("Welcome back! You have successfully logged in.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      showError(err);
      if (err.response?.status === 400) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6 px-0 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to access your health dashboard
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
          <FormPasswordInput
            control={form.control}
            name="password"
            label="Password"
          />
          {error && (
            <div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-2 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button type="submit" className="w-full" loading={isLoading}>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
