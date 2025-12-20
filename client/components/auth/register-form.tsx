"use client";

import { FormInput, FormPasswordInput, FormSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";
import { registerSchema, RegisterValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      userType: "patient",
      phone: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setError(null);
    setIsLoading(true);

    try {
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
      showSuccess("Account created successfully! Welcome to Health Pilot.");

      if (data.key) {
        localStorage.setItem("token", data.key);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      showError(err);
      const errorMessage = err.response?.data?.email?.[0] || 
                          err.response?.data?.non_field_errors?.[0] || 
                          err.message || 
                          "Registration failed. Please check your information.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6 px-0 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Join Health Pilot today and take control of your health
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-0">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="firstName"
              label="First Name"
              placeholder="John"
            />
            <FormInput
              control={form.control}
              name="lastName"
              label="Last Name"
              placeholder="Doe"
            />
          </div>
          <FormInput
            control={form.control}
            name="email"
            label="Email address"
            type="email"
            placeholder="name@example.com"
          />
          <FormPasswordInput
            control={form.control}
            name="password"
            label="Password"
          />
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <FormInput
                control={form.control}
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="col-span-2">
              <FormSelect
                control={form.control}
                name="userType"
                label="Type"
              >
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </FormSelect>
            </div>
          </div>
          {error && (
            <div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-2 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
