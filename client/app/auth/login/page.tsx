import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account to manage your health.",
};

export default function LoginPage() {
  return <LoginForm />;
}
