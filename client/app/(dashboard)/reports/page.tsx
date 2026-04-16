import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportsClient } from "./_components/reports-client";

export const metadata: Metadata = {
  title: "AI Symptom Analyzer",
  description: "Describe symptoms to receive AI-powered triage guidance and care suggestions.",
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">Loading analyzer...</div>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
