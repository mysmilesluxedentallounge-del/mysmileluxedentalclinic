import { Zap, Layers, Star, Stethoscope, Scissors, Wand2 } from "lucide-react";

const services = [
  {
    icon: Zap,
    title: "Root Canal Treatment",
    description:
      "Over 2,000 successful root canal procedures performed with precision and zero pain, preserving your natural tooth.",
    highlight: true,
  },
  {
    icon: Wand2,
    title: "Laser Smile Designing",
    description:
      "Award-winning laser smile design techniques to craft the perfect smile tailored to your face and personality.",
    highlight: false,
  },
  {
    icon: Layers,
    title: "Conservative Dentistry",
    description:
      "Minimally invasive restorations that preserve maximum natural tooth structure — fillings, inlays, and onlays.",
    highlight: false,
  },
  {
    icon: Star,
    title: "Cosmetic & Esthetic Dentistry",
    description:
      "Veneers, teeth whitening, bonding, and full smile makeovers crafted with artistic precision and attention to detail.",
    highlight: false,
  },
  {
    icon: Stethoscope,
    title: "General Dentistry",
    description:
      "Comprehensive oral health check-ups, cleanings, extractions, and preventive care for patients of all ages.",
    highlight: false,
  },
  {
    icon: Scissors,
    title: "Oral Surgery & Procedures",
    description:
      "Minor surgical procedures, wisdom tooth extractions, and advanced diagnostics performed with expert care.",
    highlight: false,
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-24"
      style={{ backgroundColor: "white" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            What We Offer
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Dental Services
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            From preventive care to advanced cosmetic procedures — all delivered
            with the luxury and precision you deserve.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  service.highlight ? "text-dark" : "bg-white border border-gray-100"
                }`}
                style={
                  service.highlight
                    ? { backgroundColor: "var(--yellow-mid)" }
                    : {}
                }
              >
                {service.highlight && (
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 translate-x-8 -translate-y-8"
                    style={{ backgroundColor: "white" }}
                  />
                )}

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: service.highlight
                      ? "rgba(255,255,255,0.3)"
                      : "var(--yellow-mid)",
                  }}
                >
                  <Icon
                    size={22}
                    color="var(--brand-dark)"
                  />
                </div>

                <h3
                  className={`text-xl font-bold mb-3 ${
                    service.highlight ? "text-gray-900" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    service.highlight ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA strip */}
        <div className="mt-14 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
          >
            Book a Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
