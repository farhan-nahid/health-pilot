import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Join Health Pilot today to manage your healthcare journey.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
