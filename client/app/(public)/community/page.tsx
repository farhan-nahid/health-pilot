import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the Health Pilot community of patients and healthcare providers.",
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
      <h1 className="mb-4 font-bold text-4xl">Community</h1>
      <p className="mt-4 text-gray-600 text-lg leading-8 dark:text-gray-400">
        Connect with other Health Pilot users, share experiences, and learn from
        healthcare professionals.
      </p>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-8 dark:border-zinc-800">
          <h2 className="font-semibold text-xl">Forums</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Join the discussion on our community forums.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-8 dark:border-zinc-800">
          <h2 className="font-semibold text-xl">Events</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Participate in our regular health webinars.
          </p>
        </div>
      </div>
    </div>
  );
}
