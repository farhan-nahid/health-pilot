"use client";

import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Star,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Doctors", href: "/doctors", icon: Users, roles: ["patient"] },
  { name: "Patients", href: "/patients", icon: Users, roles: ["doctor"] },
  {
    name: "Medical Reports",
    href: "/reports",
    icon: FileText,
    roles: ["patient", "doctor"],
  },
  { name: "Schedule", href: "/schedule", icon: Clock, roles: ["doctor"] },
  { name: "Reviews", href: "/reviews", icon: Star, roles: ["doctor", "patient"] },
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    if (isLoading || !user) return false;
    return item.roles.includes(user.user_type);
  });

  return (
    <div className={cn("flex w-64 flex-col border-r bg-card transition-all", className)}>
      <div className="flex h-20 flex-col justify-center space-y-1 border-b px-6">
        <div className="flex items-center">
          <Activity className="mr-2 h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Health Pilot</span>
        </div>
        {!isLoading && user && (
          <div className="flex items-center">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase tracking-wider">
              {user.user_type}
            </span>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-4 py-2 font-medium text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center p-2 text-muted-foreground text-xs italic">
          v1.0.0-alpha
        </div>
      </div>
    </div>
  );
}
