import { Activity } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex lg:flex-1 items-center gap-8">
        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Health Pilot</span>
        </Link>
        
        <div className="hidden lg:flex gap-x-8">
          <Link href="/features" className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
          <Link href="/about" className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
          <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
        </div>
      </div>
      
      <div className="flex flex-1 justify-end items-center gap-x-6">
        <Link 
          href="/auth/login" 
          className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Log in <span aria-hidden="true">&rarr;</span>
        </Link>
        <Link
          href="/auth/register"
          className="hidden sm:block rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
        >
          Sign up
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
