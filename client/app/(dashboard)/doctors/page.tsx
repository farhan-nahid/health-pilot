import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsClient } from "./_components/doctors-client";

export const metadata: Metadata = {
  title: "Doctors",
  description: "Find and book appointments with healthcare professionals.",
};

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">Loading doctors...</div>
      }
    >
      <DoctorsClient />
    </Suspense>
  );
}
