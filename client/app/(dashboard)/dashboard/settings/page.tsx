import type { Metadata } from "next";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customize your application preferences and security settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and application experience.
        </p>
      </div>

      <SettingsClient />
    </div>
  );
}
