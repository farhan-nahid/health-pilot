import { Mail, MapPin, Phone, Send } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Health Pilot team for support or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl dark:text-white">
          Get in touch
        </h2>
        <p className="mt-6 text-gray-600 text-lg leading-8 dark:text-gray-400">
          Have questions about Health Pilot? Our team is here to help you get started or
          answer any technical inquiries.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="space-y-8">
          <div className="flex gap-x-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 leading-7 dark:text-white">
                Email
              </h3>
              <p className="mt-2 font-medium text-gray-600 leading-7 dark:text-gray-400">
                support@healthpilot.tech
              </p>
            </div>
          </div>

          <div className="flex gap-x-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 leading-7 dark:text-white">
                Phone
              </h3>
              <p className="mt-2 font-medium text-gray-600 leading-7 dark:text-gray-400">
                +1 (555) 000-0000
              </p>
            </div>
          </div>

          <div className="flex gap-x-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 leading-7 dark:text-white">
                Office
              </h3>
              <p className="mt-2 font-medium text-gray-600 leading-7 dark:text-gray-400">
                123 Healthcare Way, Silicon Valley, CA 94025
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-6 rounded-3xl border border-gray-100 bg-gray-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <label
                htmlFor="first-name"
                className="block font-semibold text-gray-900 text-sm leading-6 dark:text-white"
              >
                First name
              </label>
              <input
                type="text"
                id="first-name"
                className="mt-2.5 block w-full rounded-md border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-black dark:text-white dark:ring-zinc-700"
              />
            </div>
            <div>
              <label
                htmlFor="last-name"
                className="block font-semibold text-gray-900 text-sm leading-6 dark:text-white"
              >
                Last name
              </label>
              <input
                type="text"
                id="last-name"
                className="mt-2.5 block w-full rounded-md border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-black dark:text-white dark:ring-zinc-700"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block font-semibold text-gray-900 text-sm leading-6 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-2.5 block w-full rounded-md border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-black dark:text-white dark:ring-zinc-700"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="message"
                className="block font-semibold text-gray-900 text-sm leading-6 dark:text-white"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-2.5 block w-full rounded-md border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-black dark:text-white dark:ring-zinc-700"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-center font-semibold text-sm text-white shadow-sm transition-all hover:bg-blue-500"
          >
            Send message <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
