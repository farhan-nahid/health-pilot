import { SettingsClient } from "@/components/dashboard/settings-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customize your application preferences and security settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and application experience.
        </p>
      </div>

      <SettingsClient />
    </div>
  );
}
