import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityClient } from "./_components/activity-client";

export const metadata: Metadata = {
  title: "Activity",
  description: "View your complete account activity timeline.",
};

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">Loading activity...</div>
      }
    >
      <ActivityClient />
    </Suspense>
  );
}
