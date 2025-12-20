import { ThemeToggle } from "@/components/theme-toggle";
import { Activity, Globe, Heart, Shield } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
            <Link href="/features" className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
            <Link href="/about" className="text-sm font-semibold leading-6 text-blue-600 dark:text-blue-400">About</Link>
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
        {/* Hero Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Our Mission</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                At Health Pilot, we believe that healthcare should be accessible, intelligent, and secure. 
                Our platform is designed to bridge the gap between patients and providers through innovative technology and data-driven insights.
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Values */}
        <section className="py-24 bg-gray-50/50 dark:bg-zinc-900/50 border-y border-gray-100 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  icon: Heart,
                  title: "Compassion First",
                  description: "We design every feature with the patient's well-being in mind, ensuring a supportive healthcare journey."
                },
                {
                  icon: Shield,
                  title: "Trust & Security",
                  description: "Security isn't an afterthought; it's our foundation. Your health data is protected by the highest standards."
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Breaking down geographical barriers to specialized care through our digital-first healthcare platform."
                }
              ].map((value, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
              {[
                { label: 'Registered Patients', value: '50,000+' },
                { label: 'Specialist Doctors', value: '1,200+' },
                { label: 'Uptime Guarantee', value: '99.9%' },
              ].map((stat, idx) => (
                <div key={idx} className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">{stat.label}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
