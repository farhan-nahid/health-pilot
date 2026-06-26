"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
    const params = useParams<{
        uid: string;
        token: string;
    }>();
    const router = useRouter();

    const uid = params.uid;
    const token = params.token;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                uid: uid,
                token: token,
                new_password: password
            };

            await api.post("auth/password/reset/confirm/", payload);

            showSuccess("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (error: any) {
            const errors = error.response?.data;

            const message =
                errors?.detail ||
                errors?.non_field_errors?.[0] ||
                Object.values(errors ?? {}).flat()[0] ||
                "Something went wrong.";

            showError(String(message));
        } finally {
            setLoading(false);
        }
    };

  if (!uid || !token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md border-none bg-transparent shadow-none">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-6 w-6 text-destructive" />
            </div>

            <CardTitle className="text-2xl font-bold">
              Invalid Reset Link
            </CardTitle>

            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/forgot-password">
                Request New Link
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="space-y-1 px-0 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">
                Set New Password
            </CardTitle>

            <CardDescription>
                Choose a strong password to protect your account
            </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-0">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>

                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                        Confirm New Password
                    </Label>

                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </CardContent>

            <CardFooter className="px-0 pt-6">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? (
                        "Updating..."
                    ) : (
                    <>
                        Reset Password
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                    )}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}