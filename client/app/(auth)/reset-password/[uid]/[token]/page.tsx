import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Health Pilot account.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ uid: string; token: string }>;
}) {
  const { uid, token } = await params;
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center p-8">Loading...</div>}
    >
      <ResetPasswordForm uid={uid} token={token} />
    </Suspense>
  );
}
