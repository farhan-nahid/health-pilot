import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get help and find answers to your questions about Health Pilot.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8 text-center">
      <h1 className="mb-4 font-bold text-4xl">Help Center</h1>
      <p className="mt-4 text-gray-600 text-lg leading-8 dark:text-gray-400">
        Find resources and support to help you navigate our platform.
      </p>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-8 dark:border-zinc-800">
          <h2 className="font-semibold text-xl">Search Help</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Find answers to common questions in our knowledge base.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-8 dark:border-zinc-800">
          <h2 className="font-semibold text-xl">Contact Support</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Reach out to our support team for personalized assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
