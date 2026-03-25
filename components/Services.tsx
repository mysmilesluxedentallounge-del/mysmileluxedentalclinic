import Image from "next/image";
import { Zap, Layers, Star, Stethoscope, Scissors, Wand2, ArrowRight } from "lucide-react";

const smallServices = [
  {
    icon: Wand2,
    title: "Laser Smile Designing",
    description: "Award-winning laser techniques crafting the perfect smile tailored to your face and personality.",
  },
  {
    icon: Star,
    title: "Cosmetic & Esthetic Dentistry",
    description: "Veneers, whitening, bonding, and full smile makeovers with artistic precision.",
  },
  {
    icon: Stethoscope,
    title: "General Dentistry",
    description: "Comprehensive check-ups, cleanings, extractions and preventive care for all ages.",
  },
  {
    icon: Scissors,
    title: "Oral Surgery & Procedures",
    description: "Expert wisdom tooth extractions and surgical procedures with the utmost care.",
  },
  {
    icon: Layers,
    title: "Conservative Dentistry",
    description: "Minimally invasive fillings, inlays and onlays preserving your natural tooth structure.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-28 relative overflow-hidden"
      style={{ background: "#faf9f6" }}
    >
      {/* Ambient gold glow top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Gold hairline bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(201,168,76,0.25) 50%, transparent 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase mb-5"
            style={{ color: "#c9a84c" }}
          >
            <span className="block w-8 h-px" style={{ background: "#c9a84c" }} />
            What We Offer
            <span className="block w-8 h-px" style={{ background: "#c9a84c" }} />
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
          >
            Our Dental Services
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "var(--grey-mid)" }}>
            From preventive care to advanced cosmetic procedures — all delivered
            with the luxury and precision you deserve.
          </p>
        </div>

        {/* Editorial grid: featured left col, 5 small cards in cols 2–3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">

          {/* ── Featured card: Root Canal (left col, full height) ── */}
          <div
            className="group relative rounded-3xl overflow-hidden lg:row-span-3 flex flex-col"
            style={{
              background: "linear-gradient(155deg, #c9a84c 0%, #a8842e 45%, #6b5018 100%)",
              minHeight: "420px",
            }}
          >
            {/* Dot texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.07) 1.5px, transparent 0)",
                backgroundSize: "26px 26px",
              }}
            />
            {/* Top-right glow orb */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,245,200,0.25) 0%, transparent 65%)",
              }}
            />
            {/* Tooth watermark */}
            <div className="absolute -bottom-6 -right-6 w-56 h-56 opacity-[0.10] pointer-events-none select-none">
              <Image src="/tooth.png" alt="" fill className="object-contain" />
            </div>

            <div className="relative z-10 p-8 flex flex-col flex-1">
              {/* Tag */}
              <span
                className="self-start px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-7"
                style={{ background: "rgba(0,0,0,0.22)", color: "rgba(255,255,255,0.9)" }}
              >
                ✦ Signature Procedure
              </span>

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7 transition-all duration-400 group-hover:scale-110 group-hover:rotate-6"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <Zap size={30} color="white" />
              </div>

              {/* Title */}
              <h3
                className="text-3xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Root Canal Treatment
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-8 flex-1" style={{ color: "rgba(255,255,255,0.76)" }}>
                2,000+ successful procedures performed with precision and absolute zero pain.
                Our rotary endodontic technique completes treatment in a single visit —
                preserving your natural tooth and leaving you completely anxiety-free.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["2,000+ Cases", "Zero Pain", "Single Visit"].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#contact"
                className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: "white", color: "#7a5018" }}
              >
                Book Treatment
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* ── 5 small service cards (cols 2–3, auto-placed) ── */}
          {smallServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                style={{
                  background: "white",
                  border: "1px solid rgba(201,168,76,0.18)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Gold glow border on hover (overlay) */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    border: "1px solid rgba(201,168,76,0.5)",
                    boxShadow: "0 4px 24px rgba(201,168,76,0.1)",
                  }}
                />

                {/* Tooth watermark */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 opacity-[0.05] pointer-events-none select-none">
                  <Image src="/tooth.png" alt="" fill className="object-contain" />
                </div>

                {/* Icon */}
                <div
                  className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.22)",
                  }}
                >
                  <Icon size={19} color="#c9a84c" />
                </div>

                <h3
                  className="relative z-10 text-base font-bold mb-2 transition-colors duration-300"
                  style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
                >
                  {service.title}
                </h3>

                <p className="relative z-10 text-xs leading-relaxed" style={{ color: "var(--grey-mid)" }}>
                  {service.description}
                </p>

                {/* Learn more arrow — slides in on hover */}
                <div className="relative z-10 mt-4 flex items-center gap-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <a href="#contact" className="text-xs font-semibold" style={{ color: "#c9a84c" }}>
                    Learn more
                  </a>
                  <ArrowRight size={11} color="#c9a84c" />
                </div>
              </div>
            );
          })}

          {/* 6th cell — mini CTA card */}
          <a
            href="#contact"
            className="group relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            style={{
              background: "rgba(201,168,76,0.04)",
              border: "1px dashed rgba(201,168,76,0.35)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
              style={{ background: "rgba(201,168,76,0.15)" }}
            >
              <ArrowRight size={18} color="#c9a84c" />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--brand-dark)" }}>Book a Consultation</p>
            <p className="text-xs" style={{ color: "var(--grey-mid)" }}>
              Get expert advice today
            </p>
          </a>

        </div>
      </div>
    </section>
  );
}
