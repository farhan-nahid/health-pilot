import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Health Pilot",
  description: "Reset your Health Pilot account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
