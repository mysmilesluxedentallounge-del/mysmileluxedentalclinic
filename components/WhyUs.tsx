import { Shield, Smile, Sparkles, Clock, FileCheck } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Minimal Invasive Dentistry",
    description:
      "Always preserve what is natural. We use the least invasive techniques to protect your natural tooth structure while achieving optimal results.",
  },
  {
    icon: Smile,
    title: "Painless Dentistry",
    description:
      "Our doctors specialise in techniques for an absolute painless experience. Say goodbye to dental anxiety — walk in relaxed, walk out smiling.",
  },
  {
    icon: Sparkles,
    title: "Esthetic with Precision",
    description:
      "All procedures are done with absolute care for minute details. Every smile we craft is a work of art, shaped with scientific precision.",
  },
  {
    icon: Clock,
    title: "Care & Response 24×7",
    description:
      "Dental care that is very personal. Enter as a patient and exist as a friend. We are always available whenever you need us.",
  },
  {
    icon: FileCheck,
    title: "Documentation & Ethical Practice",
    description:
      "So that you can walk in and out with absolute free hands and minds. Full transparency, honest recommendations, zero surprises.",
  },
];

export default function WhyUs() {
  return (
    <section id="about" className="py-24" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--brand-gold)" }}
          >
            Why Choose Us
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Promise to You
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Five core principles that define every patient experience at MySmile
            Lux Dental Lounge.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`group relative rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
                style={{ backgroundColor: i % 2 === 0 ? "white" : "var(--yellow-lightest)" }}
              >
                {/* Gold accent line */}
                <div
                  className="absolute top-0 left-8 h-[3px] w-12 rounded-full transition-all duration-300 group-hover:w-20"
                  style={{ backgroundColor: "var(--yellow-mid)" }}
                />

                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 mt-2"
                  style={{ backgroundColor: "var(--yellow-mid)" }}
                >
                  <Icon size={24} color="var(--brand-dark)" />
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {pillar.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
