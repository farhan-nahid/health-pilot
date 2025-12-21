import { ReportsClient } from "@/components/dashboard/reports/reports-client";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Medical Reports",
  description: "Securely manage and analyze your medical documents with AI.",
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">Loading reports...</div>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
