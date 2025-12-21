import { Bell, Calendar, Lock, PieChart, Search, Zap } from "lucide-react";
import type { Metadata } from "next";

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
            <h2 className="font-semibold text-base text-blue-600 leading-7">
              Enterprise Features
            </h2>
            <p className="mt-2 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl dark:text-white">
              Powerful tools for modern healthcare
            </p>
            <p className="mt-6 text-gray-600 text-lg leading-8 dark:text-gray-400">
              A comprehensive suite of features designed to streamline every aspect of
              patient care and clinical management.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "AI Report Summaries",
                  description:
                    "Upload medical reports in PDF format and get instant AI-powered summaries, highlighting critical findings and recommendations.",
                },
                {
                  icon: Calendar,
                  title: "Smart Scheduling",
                  description:
                    "Intuitive appointment booking system with automated reminders for both patients and healthcare providers.",
                },
                {
                  icon: Lock,
                  title: "Medical Privacy",
                  description:
                    "State-of-the-art encryption ensures that sensitive patient records are only accessible to authorized clinical personnel.",
                },
                {
                  icon: Search,
                  title: "Advanced Patient Search",
                  description:
                    "Quickly find and filter patient records by name, email, clinical history, or specific health parameters.",
                },
                {
                  icon: PieChart,
                  title: "Health Analytics",
                  description:
                    "Visual dashboards showing health trends, vitals history, and longitudinal data analysis for better diagnostic decisions.",
                },
                {
                  icon: Bell,
                  title: "Instant Notifications",
                  description:
                    "Get notified immediately about new reports, appointment changes, or critical alerts regarding patient health vitals.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-3xl border border-gray-100 bg-gray-50 p-8 transition-all hover:border-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <dt className="font-semibold text-base text-gray-900 leading-7 dark:text-white">
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600 leading-7 dark:text-gray-400">
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
