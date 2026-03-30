import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";


const services: { name: string; desc: string; image: string; cta: string; accent: string; accentBg: string }[] = [
  { name: "Smile Designing",      desc: "Bespoke makeovers tailored to your face and personality.",           image: "https://images.pexels.com/photos/3762453/pexels-photo-3762453.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Transform My Smile",       accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Veneers",              desc: "Ultra-thin porcelain shells for a flawless, natural finish.",        image: "https://images.pexels.com/photos/6627284/pexels-photo-6627284.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Transform My Smile",       accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Teeth Whitening",      desc: "In-clinic whitening — brighter smile in under an hour.",             image: "https://images.pexels.com/photos/5622271/pexels-photo-5622271.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Whitening Session",   accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Cosmetic Fillings",    desc: "Tooth-coloured fillings that disappear into your smile.",            image: "https://images.pexels.com/photos/3845759/pexels-photo-3845759.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Consultation",        accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Implants",             desc: "Permanent titanium roots that look and feel completely natural.",    image: "https://images.pexels.com/photos/4687905/pexels-photo-4687905.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Free Consultation",   accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Crowns & Bridges",     desc: "Lifelike restorations that bring damaged teeth back to life.",       image: "https://images.pexels.com/photos/6502345/pexels-photo-6502345.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Consultation",        accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "BPS Dentures",         desc: "Custom-fitted dentures with superior comfort and stability.",        image: "https://images.pexels.com/photos/5355826/pexels-photo-5355826.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Consultation",        accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Full Mouth Rehab",     desc: "Comprehensive reconstruction restoring full oral function.",         image: "https://images.pexels.com/photos/7788511/pexels-photo-7788511.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Start Rehabilitation",     accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Teeth Cleaning",       desc: "Professional scaling and polishing for a fresh, healthy mouth.",    image: "https://images.pexels.com/photos/3845744/pexels-photo-3845744.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Cleaning",            accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Painless Root Canals", desc: "2,000+ cases — single-visit, zero-pain rotary endodontics.",        image: "https://images.pexels.com/photos/7800562/pexels-photo-7800562.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Start Your Smile Journey", accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Surgical Extractions", desc: "Expert removal with minimal recovery and expert aftercare.",         image: "https://images.pexels.com/photos/4687401/pexels-photo-4687401.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Book Consultation",        accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
  { name: "Laser Dentistry",      desc: "Precise laser treatments for gums, cavities, and whitening.",       image: "https://images.pexels.com/photos/6629416/pexels-photo-6629416.jpeg?auto=compress&cs=tinysrgb&w=800",  cta: "Explore Laser Dentistry",  accent: "#c9a84c", accentBg: "rgba(201,168,76,0.07)"    },
];

export default function Services() {
  return (
    <section
      id="services"
      className="pt-10 pb-28 relative overflow-hidden"
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

        {/* Category groups */}
        <div className="space-y-4">
          {services.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={s.name}
                className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden"
                style={{
                  background: "white",
                  border: "1px solid rgba(201,168,76,0.18)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  minHeight: "220px",
                }}
              >
                {/* Text side */}
                <div
                  className={`relative flex flex-col justify-center px-8 py-7 ${flip ? "lg:order-2" : "lg:order-1"}`}
                >
                  <div
                    className="absolute top-0 bottom-0 w-1"
                    style={{
                      background: s.accent,
                      left: flip ? "auto" : 0,
                      right: flip ? 0 : "auto",
                    }}
                  />
                  <div className="relative z-10">
                    <p
                      className="text-lg font-bold mb-2"
                      style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
                    >
                      {s.name}
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--grey-mid)" }}>
                      {s.desc}
                    </p>
                    <a
                      href="#contact"
                      className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: s.accentBg, color: s.accent, border: `1px solid ${s.accent}33` }}
                    >
                      {s.cta}
                      <ArrowRight size={11} />
                    </a>
                  </div>
                </div>

                {/* Image side */}
                <div
                  className={`relative min-h-[200px] lg:min-h-0 ${flip ? "lg:order-1" : "lg:order-2"}`}
                >
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: flip
                        ? "linear-gradient(to left, transparent 55%, rgba(255,255,255,0.12) 100%)"
                        : "linear-gradient(to right, transparent 55%, rgba(255,255,255,0.12) 100%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
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
