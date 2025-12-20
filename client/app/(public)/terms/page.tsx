import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for using the Health Pilot platform.",
};

export default function TermsPage() {
  return (
    <div className="py-24 px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400">
        <p>By accessing the website at Health Pilot, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">1. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Health Pilot's website for personal, non-commercial transitory viewing only.</p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">2. Disclaimer</h2>
        <p>The materials on Health Pilot's website are provided on an 'as is' basis. Health Pilot makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">3. Medical Advice</h2>
        <p>The information provided through this platform is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
      </div>
    </div>
  );
}
