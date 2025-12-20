import { ProfileClient } from "@/components/dashboard/profile-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal information and account settings.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <ProfileClient />
    </div>
  );
}
