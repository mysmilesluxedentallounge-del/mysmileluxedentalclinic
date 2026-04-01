"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What are the signs that I might need a root canal?",
    answer:
      "Signs you might need a root canal include severe tooth pain, prolonged tooth sensitivity to hot or cold, gum swelling, darkening of the tooth, and tenderness when chewing.",
  },
  {
    question: "What is the process for getting dental implants at MySmile?",
    answer:
      "At MySmile, getting dental implants involves a consultation, implant placement, a healing period for bone integration, and then fitting the abutment and crown.",
  },
  {
    question: "Can I get invisible aligners at MySmile?",
    answer:
      "Yes, MySmile offers invisible aligners across various leading brands, tailored to your teeth alignment needs and lifestyle. Our team will assess your case and recommend the best option for you.",
  },
  {
    question: "What types of braces does MySmile offer?",
    answer:
      "MySmile offers various types of braces including traditional metal braces, ceramic braces (tooth-colored) & clear aligners like Invisalign, tailored to individual needs.",
  },
  {
    question: "What safety measures are in place at MySmile?",
    answer:
      "At MySmile, we follow stringent safety protocols including radiation safety and a multi-step sterilization process for all instruments, ensuring a safe and hygienic environment for every patient.",
  },
  {
    question: "How do I cancel or reschedule my appointment?",
    answer:
      "To cancel or reschedule your appointment, contact our clinic directly at +91 6304693676 or reach us via email at mysmileluxedentallounge@gmail.com. Our team will be happy to assist you.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section className="py-24" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex-1 max-w-[60px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.5)" }} />
            <span
              className="text-xs font-semibold tracking-[0.3em] uppercase"
              style={{ color: "var(--yellow-mid)" }}
            >
              FAQ
            </span>
            <span className="flex-1 max-w-[60px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.5)" }} />
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
            Everything you need to know before your visit. Can&apos;t find your answer?{" "}
            <a
              href="#contact"
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--yellow-mid)" }}
            >
              Get in touch
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden transition-all duration-300"
                style={{
                  borderColor: isOpen ? "var(--yellow-mid)" : "#e5e7eb",
                  backgroundColor: isOpen ? "#fffdf5" : "#ffffff",
                  boxShadow: isOpen ? "0 4px 20px rgba(201,168,76,0.12)" : "none",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-sm font-semibold text-gray-800 leading-snug"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {faq.question}
                  </span>
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? "var(--yellow-mid)" : "#f3f4f6",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <ChevronDown
                      size={15}
                      color={isOpen ? "var(--brand-dark)" : "#6b7280"}
                    />
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "300px" : "0px" }}
                >
                  <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
