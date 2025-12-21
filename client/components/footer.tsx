import { Activity, Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-gray-100 border-t bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl tracking-tight dark:text-white">
                Health Pilot
              </span>
            </Link>
            <p className="max-w-xs text-gray-600 text-sm leading-6 dark:text-gray-400">
              Empowering healthcare through intelligence. Manage patients, appointments,
              and records with enterprise-grade security.
            </p>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-gray-400 transition-colors hover:text-blue-600"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 transition-colors hover:text-blue-700"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-6 dark:text-white">
                Solutions
              </h3>
              <ul className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    AI Report Summaries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Smart Scheduling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Health Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Patient Portals
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-6 dark:text-white">
                Support
              </h3>
              <ul className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 xl:col-span-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-6 dark:text-white">
                Legal
              </h3>
              <ul className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    HIPAA Compliance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 text-sm leading-6 transition-colors hover:text-blue-600 dark:text-gray-400"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 items-center border-gray-100 border-t pt-8 xl:grid xl:grid-cols-3 xl:gap-8 dark:border-zinc-800">
          <div className="overflow-hidden xl:col-span-2">
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="max-w-md">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm leading-6 dark:text-white">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Join our newsletter
                </h3>
                <p className="mt-2 text-gray-600 text-xs dark:text-gray-400">
                  Stay updated with the latest in health tech and clinical management.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end xl:mt-0">
            <p className="text-gray-500 text-xs leading-5 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Health Pilot Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
