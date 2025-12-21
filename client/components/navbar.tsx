import { Activity } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
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

        <div className="hidden gap-x-8 lg:flex">
          <Link
            href="/features"
            className="font-semibold text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="font-semibold text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-semibold text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            Contact
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-x-6">
        <Link
          href="/auth/login"
          className="font-semibold text-gray-900 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
        >
          Log in <span aria-hidden="true">&rarr;</span>
        </Link>
        <Link
          href="/auth/register"
          className="hidden rounded-full bg-blue-600 px-4 py-2 font-semibold text-sm text-white shadow-sm transition-all hover:bg-blue-500 sm:block"
        >
          Sign up
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
