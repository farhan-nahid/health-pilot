import { Activity, Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Health Pilot
              </span>
            </Link>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400 max-w-xs">
              Empowering healthcare through intelligence. Manage patients, appointments,
              and records with enterprise-grade security.
            </p>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Solutions
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/features"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    AI Report Summaries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Smart Scheduling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Health Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Patient Portals
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Support
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/faq"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 xl:col-span-1">
              <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Legal
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    HIPAA Compliance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm leading-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 dark:border-zinc-800 pt-8 xl:grid xl:grid-cols-3 xl:gap-8 items-center">
          <div className="xl:col-span-2 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="max-w-md">
                <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Join our newsletter
                </h3>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Stay updated with the latest in health tech and clinical management.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 xl:mt-0 flex justify-end">
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Health Pilot Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
