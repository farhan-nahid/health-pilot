import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how Health Pilot uses cookies to improve your experience.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <h1 className="mb-8 font-bold text-4xl">Cookie Policy</h1>
      <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400">
        <p>
          Health Pilot uses cookies to help improve your experience and to understand how
          our platform is used.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          What are cookies?
        </h2>
        <p>
          Cookies are small text files that are stored on your device when you visit a
          website.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          How we use them
        </h2>
        <p>
          We use strictly necessary cookies for authentication and session management. We
          also use analytical cookies to help us improve our services.
        </p>
      </div>
    </div>
  );
}
