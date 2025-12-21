import type { Metadata } from "next";
import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal information and account settings.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Profile</h2>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

      <ProfileClient />
    </div>
  );
}
