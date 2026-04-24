"use client";

import { Check } from "lucide-react";
import Image from "next/image";

const plans = [
  {
    name: "Premium Dental Health Plan",
    price: "299",
    icon: "/svgs/dental-care.png",
    badge: "Best Value",
    benefits: [
      "₹1,800 treatment coupon redeemable against any dental procedure.",
      "Free Consultation and X-ray.",
    ],
  },
  {
    name: "Super Speciality Dental Health Plan",
    price: "499",
    icon: "/svgs/protection.png",
    badge: "Most Popular",
    benefits: [
      "₹1,800 treatment coupon redeemable against any dental procedure.",
      "₹3,500 off on ortho & implants treatment.",
      "Priority booking with specialist doctors.",
    ],
  },
];

export default function DentalHealthPlans() {
  return (
    <section className="py-20" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex-1 max-w-[60px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.5)" }} />
            <span
              className="text-xs font-semibold tracking-[0.3em] uppercase"
              style={{ color: "var(--yellow-mid)" }}
            >
              Health Plans
            </span>
            <span className="flex-1 max-w-[60px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.5)" }} />
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Dental Health Plans for All
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto">
            Invest in your smile with our affordable health plans — packed with benefits and savings on every visit.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="relative bg-white rounded-3xl border border-gray-100 p-8 flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Badge */}
              <span
                className="absolute top-5 right-5 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "var(--yellow-mid)" }}
              >
                {plan.badge}
              </span>

              {/* Plan icon */}
              <div className="mb-5">
                <Image src={plan.icon} alt={plan.name} width={64} height={64} className="object-contain" />
              </div>

              {/* Plan name */}
              <h3
                className="text-lg font-bold text-gray-900 mb-5 leading-snug pr-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {plan.name}
              </h3>

              {/* Benefits */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.benefits.map((b, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(201,168,76,0.15)" }}
                    >
                      <Check size={10} color="var(--yellow-mid)" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-gray-600 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--yellow-mid)" }}>
                    Special Offer
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹ {plan.price}
                  </p>
                </div>
                <a
                  href="#contact"
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                >
                  Buy Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
