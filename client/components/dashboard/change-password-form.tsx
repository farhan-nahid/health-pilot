"use client";

import { FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { changePasswordSchema, ChangePasswordValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password1: "",
      new_password2: "",
    },
  });

  const onSubmit = (values: ChangePasswordValues) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormPasswordInput
            control={form.control}
            name="old_password"
            label="Current Password"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormPasswordInput
              control={form.control}
              name="new_password1"
              label="New Password"
            />
            <FormPasswordInput
              control={form.control}
              name="new_password2"
              label="Confirm New Password"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-end">
          <Button type="submit" loading={changePassword.isPending}>
            Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
