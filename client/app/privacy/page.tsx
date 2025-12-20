import { ThemeToggle } from "@/components/theme-toggle";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex lg:flex-1 items-center gap-8">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Health Pilot</span>
          </Link>
        </div>
        <div className="flex flex-1 justify-end items-center gap-x-6">
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-grow py-24 px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert">
          <p className="lead">Your privacy is important to us. It is Health Pilot's policy to respect your privacy regarding any information we may collect from you across our website.</p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information we collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Information</h2>
          <p>We use the information we collect in various ways, including to provide, operate, and maintain our website, and to improve, personalize, and expand our services.</p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
          <p>We use commercially acceptable means to protect your personal information from loss or theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. HIPAA Compliance</h2>
          <p>Health Pilot is committed to maintaining the privacy and security of protected health information (PHI) in accordance with HIPAA standards.</p>
        </div>
      </main>
    </div>
  );
}
