"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HOME_FAQS } from "@/lib/site-seo";

const faqs = HOME_FAQS;

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
