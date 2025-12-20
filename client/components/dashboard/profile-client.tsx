"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatientProfile, useUpdatePatientProfile } from "@/hooks/use-patient";
import { useUpdateUser, useUser } from "@/hooks/use-user";
import { showError, showSuccess } from "@/lib/notifications";
import { useEffect, useState } from "react";

export function ProfileClient() {
  const { user, isLoading: userLoading } = useUser();
  const { profile, isLoading: profileLoading } = usePatientProfile();
  
  const updateUserMutation = useUpdateUser();
  const updatePatientMutation = useUpdatePatientProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setDob(profile.date_of_birth || "");
      setBloodGroup(profile.blood_group || "");
      setAddress(profile.address || "");
      setEmergencyContact(profile.emergency_contact || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Parallel updates
      const promises = [
        updateUserMutation.mutateAsync({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
      ];

      if (user?.user_type === 'patient') {
        promises.push(
          updatePatientMutation.mutateAsync({
            date_of_birth: dob || null,
            blood_group: bloodGroup || null,
            address: address || null,
            emergency_contact: emergencyContact || null,
          })
        );
      }

      await Promise.all(promises);
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      showError(err);
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  const isLoading = userLoading || (user?.user_type === 'patient' && profileLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Basic identity and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {user?.user_type === 'patient' && (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Profile</CardTitle>
              <CardDescription>
                Detailed medical information for better care.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name and Phone Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Detailed address..."
                  className="resize-none h-24"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {error && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-600 text-sm font-medium bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
              {success}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={updateUserMutation.isPending || updatePatientMutation.isPending}
          >
            Save Complete Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

