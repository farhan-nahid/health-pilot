"use client"

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  // Extract page title from pathname
  const title = pathname === '/dashboard' 
    ? 'Dashboard' 
    : pathname?.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
