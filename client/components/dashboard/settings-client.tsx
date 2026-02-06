"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/hooks/use-settings";
import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ChangePasswordForm } from "./change-password-form";

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { settings, isLoading, updateSettings } = useSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Health Pilot looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Interface Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  <span className="font-medium text-sm">Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  <span className="font-medium text-sm">Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  <span className="font-medium text-sm">System</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm />

      {/* <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what updates you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Reminders</Label>
              <p className="text-muted-foreground text-xs">
                Receive notifications for your upcoming appointments.
              </p>
            </div>
            <Switch
              checked={settings?.appointment_reminders}
              onCheckedChange={(checked) => {
                updateSettings(
                  { appointment_reminders: checked },
                  {
                    onSuccess: () => showSuccess("Appointment reminders updated."),
                    onError: (err) => showError(err),
                  },
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <Label>Health Tips</Label>
              <p className="text-muted-foreground text-xs">
                Get personalized health insights and tips.
              </p>
            </div>
            <Switch
              checked={settings?.health_tips}
              onCheckedChange={(checked) => {
                updateSettings(
                  { health_tips: checked },
                  {
                    onSuccess: () => showSuccess("Health tips preference updated."),
                    onError: (err) => showError(err),
                  },
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-muted-foreground text-xs">
                Notifications about your account login and security.
              </p>
            </div>
            <Switch
              checked={settings?.security_alerts}
              onCheckedChange={(checked) => {
                updateSettings(
                  { security_alerts: checked },
                  {
                    onSuccess: () => showSuccess("Security alerts preference updated."),
                    onError: (err) => showError(err),
                  },
                );
              }}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardHeader>
          <CardTitle>Account Data</CardTitle>
          <CardDescription>Manage your personal data and account status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-muted-foreground text-xs">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch
              checked={settings?.two_factor_auth}
              onCheckedChange={(checked) => {
                updateSettings(
                  { two_factor_auth: checked },
                  {
                    onSuccess: () =>
                      showSuccess("Two-factor authentication preference updated."),
                    onError: (err) => showError(err),
                  },
                );
              }}
            />
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
