"use client";

import { Activity, Menu } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-gray-100 border-b bg-white/80 p-6 backdrop-blur-md lg:px-8 dark:border-zinc-800 dark:bg-black/80">
      <div className="flex items-center gap-8 lg:flex-1">
        <Link href="/" className="-m-1.5 flex items-center gap-2 p-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl tracking-tight dark:text-white">
            Health Pilot
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden gap-x-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-semibold text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-x-6">
        {/* Desktop Actions */}
        <div className="hidden items-center gap-x-6 lg:flex">
          {!isLoading && user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-sm text-white shadow-sm transition-all hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="font-semibold text-gray-900 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-sm text-white shadow-sm transition-all hover:bg-blue-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* Mobile Menu Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-75 sm:w-100">
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 font-semibold text-gray-900 text-lg transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="my-4 border-gray-100 dark:border-zinc-800" />
              {!isLoading && user ? (
                <Link
                  href="/dashboard"
                  className="mx-4 rounded-full bg-blue-600 px-4 py-3 text-center font-semibold text-lg text-white shadow-sm transition-all hover:bg-blue-500"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 font-semibold text-gray-900 text-lg transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="mx-4 mt-2 rounded-full bg-blue-600 px-4 py-3 text-center font-semibold text-lg text-white shadow-sm transition-all hover:bg-blue-500"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
