import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null); // fixed: removed TypeScript type

  const faqs = [
    {
      question: "What is the time limit for filing a POSH complaint?",
      answer:
        "A complaint must be filed within 3 months from the date of incident. However, the Internal Committee may extend this period if it is satisfied that the circumstances prevented the complainant from filing within the specified time, provided reasons are recorded in writing.",
    },
    {
      question: "Can men file complaints under POSH Act?",
      answer:
        "The POSH Act specifically protects women from sexual harassment. However, men facing sexual harassment can file complaints under other laws like Section 354A of the Indian Penal Code or under company policies dealing with workplace harassment.",
    },
    {
      question: "What if my workplace doesn't have an Internal Committee?",
      answer:
        "If your workplace has 10 or more employees and doesn't have an Internal Committee, it's a violation of POSH Act. You can file a complaint with the Local Committee constituted by the District Collector. You can also report this non-compliance to appropriate authorities.",
    },
    {
      question: "Can I file an anonymous complaint?",
      answer:
        "No, anonymous complaints cannot be entertained under POSH Act. However, the identity of the complainant is kept confidential throughout the process, and any breach of confidentiality is punishable.",
    },
    {
      question: "What happens if I file a false complaint?",
      answer:
        "Filing a false or malicious complaint can result in disciplinary action equivalent to what would have been taken against the respondent if the complaint was proven. However, mere inability to prove the complaint doesn't constitute a false complaint.",
    },
    {
      question: "Can the respondent be suspended during inquiry?",
      answer:
        "Yes, if the Internal Committee recommends during the inquiry, the employer may transfer the complainant or respondent to other workplace, grant leave, or take other interim measures as deemed appropriate.",
    },
    {
      question: "What if I'm not satisfied with the IC's decision?",
      answer:
        "You can file an appeal before a court or tribunal within 90 days of the recommendation by the Internal Committee. The appellate authority will then review the case.",
    },
    {
      question: "Does POSH Act cover incidents outside office premises?",
      answer:
        "Yes, POSH Act covers sexual harassment that occurs in connection with work or in the course of employment, even if it happens outside the office premises, including during official trips, events, or work-related social gatherings.",
    },
    {
      question: "What support can I expect during the complaint process?",
      answer:
        "You have the right to interim relief (like transfer of either party), counseling, medical examination, legal aid, and protection from retaliation. The employer must ensure you face no adverse consequences for filing the complaint.",
    },
    {
      question: "How long does the inquiry process take?",
      answer:
        "The Internal Committee must complete the inquiry within 90 days of receiving the complaint. In exceptional circumstances, this period may be extended, but reasons must be recorded in writing and communicated to all parties.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="h-8 w-8 text-red-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-lg text-gray-600">
          Get answers to common questions about POSH law and your rights
        </p>
      </motion.div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 last:border-b-0">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {activeIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-red-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
