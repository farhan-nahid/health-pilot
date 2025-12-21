"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FormInput, FormPasswordInput, FormSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { type RegisterValues, registerSchema } from "@/schemas/auth";

export function RegisterForm() {
  const { register } = useAuth();

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

  const onSubmit = (values: RegisterValues) => {
    register.mutate(values);
  };

  const errorMessage = register.error
    ? (register.error as any).response?.data?.email?.[0] ||
      (register.error as any).response?.data?.non_field_errors?.[0] ||
      (register.error as any).message ||
      "Registration failed. Please check your information."
    : null;

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="font-bold text-2xl">Create an account</CardTitle>
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
          <FormPasswordInput control={form.control} name="password" label="Password" />
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
              <FormSelect control={form.control} name="userType" label="Type">
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </FormSelect>
            </div>
          </div>
          {errorMessage && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 py-2 text-center font-medium text-destructive text-sm">
              {errorMessage}
            </div>
          )}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
        <CardFooter className="px-0 pt-6">
          <Button type="submit" className="w-full" loading={register.isPending}>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
