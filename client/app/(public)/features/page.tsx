import { Bell, Calendar, Lock, PieChart, Search, Zap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore the powerful features of Health Pilot for modern healthcare.",
};

export default function FeaturesPage() {
  return (
    <>
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
    </>
  );
}
