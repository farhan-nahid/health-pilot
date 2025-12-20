import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently Asked Questions about Health Pilot.",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I upload medical reports?",
      answer: "Once logged in as a patient, navigate to 'Medical Reports' and click 'Upload Report'. You can select any PDF document for AI summary analysis."
    },
    {
      question: "Is my medical data secure?",
      answer: "Yes, we use enterprise-grade end-to-end encryption and follow HIPAA compliance standards to ensure your sensitive health data remains private and secure."
    },
    {
      question: "Can I choose my own doctor?",
      answer: "Currently, our system matches you with available specialists based on your health needs, or you can browse the specialist directory to book directly."
    },
    {
      question: "How does the AI summary work?",
      answer: "Our advanced AI models process the text within your medical reports to provide a concise summary of findings, symptoms, and potential next steps for your doctor to review."
    }
  ];

  return (
    <div className="py-24 px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h1>
      <div className="space-y-8">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h2>
            <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
