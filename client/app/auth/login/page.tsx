import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account to manage your health.",
};

export default function LoginPage() {
  return <LoginForm />;
}
