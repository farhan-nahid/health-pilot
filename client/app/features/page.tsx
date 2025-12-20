import { ThemeToggle } from "@/components/theme-toggle";
import { Activity, Bell, Calendar, Lock, PieChart, Search, Zap } from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex lg:flex-1 items-center gap-8">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Health Pilot</span>
          </Link>
          
          <div className="hidden lg:flex gap-x-8">
            <Link href="/features" className="text-sm font-semibold leading-6 text-blue-600 dark:text-blue-400">Features</Link>
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
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-grow">
        {/* Features Hero */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Enterprise Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Powerful tools for modern healthcare
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                A comprehensive suite of features designed to streamline every aspect of patient care and clinical management.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
                {[
                  {
                    icon: Zap,
                    title: "AI Report Summaries",
                    description: "Upload medical reports in PDF format and get instant AI-powered summaries, highlighting critical findings and recommendations."
                  },
                  {
                    icon: Calendar,
                    title: "Smart Scheduling",
                    description: "Intuitive appointment booking system with automated reminders for both patients and healthcare providers."
                  },
                  {
                    icon: Lock,
                    title: "Medical Privacy",
                    description: "State-of-the-art encryption ensures that sensitive patient records are only accessible to authorized clinical personnel."
                  },
                  {
                    icon: Search,
                    title: "Advanced Patient Search",
                    description: "Quickly find and filter patient records by name, email, clinical history, or specific health parameters."
                  },
                  {
                    icon: PieChart,
                    title: "Health Analytics",
                    description: "Visual dashboards showing health trends, vitals history, and longitudinal data analysis for better diagnostic decisions."
                  },
                  {
                    icon: Bell,
                    title: "Instant Notifications",
                    description: "Get notified immediately about new reports, appointment changes, or critical alerts regarding patient health vitals."
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex flex-col p-8 bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 transition-all hover:border-blue-500/50">
                    <div className="h-12 w-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                      {feature.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
