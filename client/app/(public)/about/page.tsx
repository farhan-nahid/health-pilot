import { Globe, Heart, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Health Pilot's mission and values.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl dark:text-white">
              Our Mission
            </h2>
            <p className="mt-6 text-gray-600 text-lg leading-8 dark:text-gray-400">
              At Health Pilot, we believe that healthcare should be accessible,
              intelligent, and secure. Our platform is designed to bridge the gap between
              patients and providers through innovative technology and data-driven
              insights.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="border-gray-100 border-y bg-gray-50/50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Compassion First",
                description:
                  "We design every feature with the patient's well-being in mind, ensuring a supportive healthcare journey.",
              },
              {
                icon: Shield,
                title: "Trust & Security",
                description:
                  "Security isn't an afterthought; it's our foundation. Your health data is protected by the highest standards.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                description:
                  "Breaking down geographical barriers to specialized care through our digital-first healthcare platform.",
              },
            ].map((value, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-white">
                  {value.title}
                </h3>
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
              { label: "Registered Patients", value: "50,000+" },
              { label: "Specialist Doctors", value: "1,200+" },
              { label: "Uptime Guarantee", value: "99.9%" },
            ].map((stat, idx) => (
              <div key={idx} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base text-gray-600 leading-7 dark:text-gray-400">
                  {stat.label}
                </dt>
                <dd className="order-first font-semibold text-3xl text-gray-900 tracking-tight sm:text-5xl dark:text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
