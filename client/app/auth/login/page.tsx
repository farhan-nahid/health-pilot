import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | Health Pilot",
  description: "Sign in to access your health dashboard",
};

export default function LoginPage() {
  return <LoginForm />;
}
