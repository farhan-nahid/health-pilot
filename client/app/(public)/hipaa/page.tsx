import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HIPAA Compliance",
  description: "Learn how Health Pilot protects your health information.",
};

export default function HIPAAPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
      <h1 className="mb-8 font-bold text-4xl">HIPAA Compliance</h1>
      <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400">
        <p className="lead">
          Health Pilot is committed to protecting the privacy and security of health 
          information in accordance with HIPAA standards.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          Data Protection
        </h2>
        <p>
          We use enterprise-grade encryption for all health data at rest and in 
          transit.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          Access Control
        </h2>
        <p>
          Strict access controls ensure that patient records are only accessible to
          authorized healthcare providers and relevant staff.
        </p>
        <h2 className="mt-8 mb-4 font-semibold text-2xl text-gray-900 dark:text-white">
          Business Associate Agreements (BAA)
        </h2>
        <p>
          We enter into BAAs with all our service providers who may have access to
          protected health information.
        </p>
      </div>
    </div>
  );
}
