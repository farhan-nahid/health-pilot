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
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Patients", href: "/dashboard/patients", icon: Users, roles: ["doctor"] },
  {
    name: "Medical Reports",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["patient", "doctor"],
  },
  { name: "Schedule", href: "/dashboard/schedule", icon: Clock, roles: ["doctor"] },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
    <div className={cn("flex flex-col w-64 border-r bg-card transition-all", className)}>
      <div className="flex flex-col justify-center h-20 px-6 border-b space-y-1">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-bold">Health Pilot</span>
        </div>
        {!isLoading && user && (
          <div className="flex items-center">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
              {user.user_type}
            </span>
          </div>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors group",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mr-3 transition-colors",
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
      <div className="p-4 border-t">
        <div className="flex items-center p-2 text-xs text-muted-foreground italic">
          v1.0.0-alpha
        </div>
      </div>
    </div>
  );
}
