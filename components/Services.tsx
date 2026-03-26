import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function ToothSVG({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3C7 3 5 5.5 5 8c0 2 .7 3.8 1.4 5.4L8.5 21c.2.8.8 1.3 1.5 1.3s1.3-.5 1.5-1.3l.5-2.5.5 2.5c.2.8.8 1.3 1.5 1.3s1.3-.5 1.5-1.3L17.6 13.4C18.3 11.8 19 10 19 8c0-2.5-2-5-5-5-1 0-1.8.4-2.4.9A4 4 0 0 0 9 3z" />
    </svg>
  );
}

function CrownSVG({ size = 22, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M4 19L5.5 8 9 13l3-8 3 8 3.5-5L21 19" />
      <rect x="4" y="19" width="16" height="2.5" rx="1" />
    </svg>
  );
}

function DentalChairIcon({ size = 22 }: IconProps) {
  return (
    <Image src="/svgs/dentalchair.webp" alt="Dental Chair" width={size} height={size} className="object-contain" />
  );
}

const categories: { icon: React.ComponentType<IconProps>; title: string; tagline: string; cta: string; accent: string; accentBg: string; services: { name: string; desc: string }[] }[] = [
  {
    icon: ToothSVG,
    title: "Cosmetic Dentistry",
    tagline: "Craft your perfect smile",
    cta: "Transform My Smile",
    accent: "#c9a84c",
    accentBg: "rgba(201,168,76,0.07)",
    services: [
      { name: "Smile Designing",   desc: "Bespoke makeovers tailored to your face and personality." },
      { name: "Veneers",           desc: "Ultra-thin porcelain shells for a flawless, natural finish." },
      { name: "Teeth Whitening",   desc: "In-clinic whitening — brighter smile in under an hour." },
      { name: "Cosmetic Fillings", desc: "Tooth-coloured fillings that disappear into your smile." },
    ],
  },
  {
    icon: CrownSVG,
    title: "Restorative Dentistry",
    tagline: "Rebuild strength & function",
    cta: "Book Consultation",
    accent: "#2c2c2c",
    accentBg: "rgba(44,44,44,0.05)",
    services: [
      { name: "Implants",          desc: "Permanent titanium roots that look and feel completely natural." },
      { name: "Crowns & Bridges",  desc: "Lifelike restorations that bring damaged teeth back to life." },
      { name: "BPS Dentures",      desc: "Custom-fitted dentures with superior comfort and stability." },
      { name: "Full Mouth Rehab",  desc: "Comprehensive reconstruction restoring full oral function." },
    ],
  },
  {
    icon: DentalChairIcon,
    title: "General Dentistry",
    tagline: "Prevention & everyday care",
    cta: "Start Your Smile Journey",
    accent: "#5a8a6a",
    accentBg: "rgba(90,138,106,0.06)",
    services: [
      { name: "Teeth Cleaning",       desc: "Professional scaling and polishing for a fresh, healthy mouth." },
      { name: "Painless Root Canals", desc: "2,000+ cases — single-visit, zero-pain rotary endodontics." },
      { name: "Surgical Extractions", desc: "Expert removal with minimal recovery and expert aftercare." },
      { name: "Laser Dentistry",      desc: "Precise laser treatments for gums, cavities, and whitening." },
    ],
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

        {/* 3 category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "white",
                border: "1px solid rgba(201,168,76,0.2)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Coloured top band */}
              <div
                className="h-1.5 w-full"
                style={{ background: cat.accent }}
              />

              {/* Tooth watermark */}
              <div className="absolute -bottom-4 -right-4 w-28 h-28 opacity-[0.04] pointer-events-none select-none">
                <Image src="/tooth.png" alt="" fill sizes="112px" className="object-contain" />
              </div>

              <div className="relative z-10 p-8 flex flex-col flex-1">
                {/* Icon + title + tagline */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: cat.accentBg,
                      border: `1.5px solid ${cat.accent}44`,
                    }}
                  >
                    <cat.icon size={22} color={cat.accent} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold leading-tight"
                      style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
                    >
                      {cat.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--grey-mid)" }}>{cat.tagline}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full mb-6" style={{ background: "rgba(201,168,76,0.18)" }} />

                {/* Service rows */}
                <ul className="space-y-4 flex-1">
                  {cat.services.map((s) => (
                    <li key={s.name} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex-shrink-0 text-xs leading-none select-none"
                        style={{ color: cat.accent }}
                      >
                        ✦
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--brand-dark)" }}>{s.name}</p>
                        <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--grey-mid)" }}>{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Card CTA */}
                <a
                  href="#contact"
                  className="mt-8 self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: cat.accentBg, color: cat.accent, border: `1px solid ${cat.accent}33` }}
                >
                  {cat.cta}
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-14 rounded-3xl px-8 py-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)",
            border: "1px solid rgba(201,168,76,0.22)",
          }}
        >
          <p className="text-sm font-semibold tracking-wide mb-1" style={{ color: "var(--grey-mid)" }}>
            Not sure which treatment is right for you?
          </p>
          <p className="text-lg font-medium mb-6" style={{ color: "var(--brand-dark)", fontFamily: "var(--font-playfair)" }}>
            Get a free consultation with our experts today.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
          >
            Book Appointment
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
