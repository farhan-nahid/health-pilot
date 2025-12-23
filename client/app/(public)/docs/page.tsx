import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use Health Pilot with our comprehensive guides.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <h1 className="mb-8 font-bold text-4xl">Documentation</h1>
      <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400">
        <p className="lead">
          Welcome to the Health Pilot documentation. This guide will help you understand
          how to get the most out of our platform.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          Getting Started
        </h2>
        <p>
          Learn how to set up your account, complete your profile, and start managing your
          health records.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          For Patients
        </h2>
        <p>
          Discover how to upload medical reports, book appointments with specialists, and
          track your health history.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          For Doctors
        </h2>
        <p>
          Manage your schedule, review patient records, and provide high-quality care
          through our integrated clinical dashboard.
        </p>
      </div>
    </div>
  );
}
