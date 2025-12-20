"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateUser, useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";

export function ProfileClient() {
  const { user, isLoading } = useUser();
  const updateMutation = useUpdateUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    updateMutation.mutate(
      {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
      {
        onSuccess: () => {
          // In a real app we might show a toast
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || err.message || "Failed to update profile");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground uppercase">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="capitalize text-sm font-medium px-3 py-2 border rounded-md bg-muted select-none">
                {user?.user_type}
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
                {error}
              </div>
            )}

            {updateMutation.isSuccess && (
              <div className="text-emerald-600 text-sm font-medium bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                Profile updated successfully!
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
