import { Activity, ArrowRight, Shield, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Health Pilot - Modern healthcare management simplified.",
};

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-20 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl dark:text-white">
              Healthcare Management{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="mt-6 text-gray-600 text-lg leading-8 dark:text-gray-400">
              Streamline patient care, manage appointments, and access medical records
              securely. The intelligent platform for modern healthcare providers and
              patients.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-sm text-white shadow-sm transition-all hover:bg-blue-500"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/features"
                className="font-semibold text-gray-900 text-sm leading-6 transition-colors hover:text-gray-600 dark:text-white"
              >
                Explore features <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended By / Trusted By Section */}
      <section className="border-gray-100 border-y bg-gray-50/50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-semibold text-gray-900 text-lg leading-8 dark:text-gray-300">
            Endorsed by Visionaries & Medical Leaders
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {[
              { name: "Bill Gates", role: "Philanthropist" },
              { name: "Satya Nadella", role: "Microsoft CEO" },
              { name: "Dr. Eric Topol", role: "Cardiologist & Author" },
              { name: "Sam Altman", role: "OpenAI CEO" },
              { name: "Elizabeth Blackburn", role: "Nobel Laureate" },
            ].map((person, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center opacity-70 transition-opacity hover:opacity-100"
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-bold text-gray-900 text-xs dark:text-gray-100">
                  {person.name}
                </span>
                <span className="text-center text-[10px] text-gray-500 dark:text-gray-400">
                  {person.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="font-semibold text-base text-blue-600 leading-7">
              Health Pilot Advantage
            </h2>
            <p className="mt-2 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl dark:text-white">
              Everything you need to manage healthcare effectively
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Advanced Security",
                  description:
                    "End-to-end encryption for all patient data and medical records. HIPAA compliant architecture.",
                },
                {
                  icon: Users,
                  title: "Unified Portal",
                  description:
                    "A single dashboard for doctors to manage patients and for patients to track their own health journey.",
                },
                {
                  icon: Activity,
                  title: "AI Analysis",
                  description:
                    "Smart processing of medical reports providing instant summaries and key health insights.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-3xl border border-gray-100 bg-gray-50 p-8 transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <dt className="flex items-center gap-x-3 font-semibold text-base text-gray-900 leading-7 dark:text-white">
                    <feature.icon
                      className="h-6 w-6 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600 leading-7 dark:text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-600 py-24 dark:bg-blue-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-12 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div>
              <h2 className="font-bold text-3xl text-white italic tracking-tight sm:text-4xl">
                "Health Pilot has transformed how I manage my clinic. The AI analysis of
                reports saves me hours every week."
              </h2>
              <div className="mt-10 flex items-center gap-x-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-base">
                  <div className="font-semibold text-lg text-white">
                    Dr. Sarah Jenkins
                  </div>
                  <div className="text-blue-100">Chief Medical Officer, MetroHealth</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                {
                  text: "Finally, a healthcare app that is intuitive and actually useful. My patients love it.",
                  author: "Dr. Marcus Chen",
                  role: "Dermatologist",
                },
                {
                  text: "Checking my medical records and booking appointments has never been easier.",
                  author: "Alice Thompson",
                  role: "Patient",
                },
                {
                  text: "The security features give me peace of mind that my data is safe.",
                  author: "Robert Wilson",
                  role: "Patient",
                },
                {
                  text: "The AI summary feature is a game-changer for reviewing complex histories.",
                  author: "Dr. Elena Rossi",
                  role: "Internist",
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
                >
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-white text-white" />
                    ))}
                  </div>
                  <p className="mb-4 text-blue-50 text-sm leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="text-xs">
                    <div className="font-bold text-white">{testimonial.author}</div>
                    <div className="text-blue-200">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl dark:text-white">
            Ready to take health management to the next level?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-gray-600 text-lg leading-8 dark:text-gray-400">
            Join thousands of healthcare professionals and patients who are already using
            Health Pilot.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-10 py-4 font-semibold text-base text-white shadow-sm transition-all hover:bg-blue-500"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
