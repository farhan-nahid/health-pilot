import { Activity, ArrowRight, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Health Pilot</span>
          </Link>
        </div>
        <div className="flex flex-1 justify-end gap-x-6">
          <Link 
            href="/auth" 
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden pt-14 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Healthcare Management Simplified
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Streamline patient care, manage appointments, and access medical records securely. 
              The intelligent platform for modern healthcare providers and patients.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth"
                className="rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all flex items-center gap-2 group"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-gray-600 transition-colors">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Enterprise-grade security protecting sensitive patient data."
              },
              {
                icon: Users,
                title: "Patient Portal",
                description: "Easy access to records, prescriptions, and appointments."
              },
              {
                icon: Activity,
                title: "Real-time Monitoring",
                description: "Track health metrics and get instant alerts on critical changes."
              }
            ].map((feature, idx) => (
              <div key={idx} className="relative p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
