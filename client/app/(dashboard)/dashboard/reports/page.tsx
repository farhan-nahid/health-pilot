import { ReportsClient } from "@/components/dashboard/reports/reports-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Reports | Health Pilot",
  description: "Securely manage and analyze your medical documents with AI.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
