import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | Health Pilot",
  description: "Set a new password for your Health Pilot account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
