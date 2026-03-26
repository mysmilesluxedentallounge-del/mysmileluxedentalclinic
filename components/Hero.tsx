import { Phone, MapPin, CalendarCheck } from "lucide-react";
import HeroVideoBg from "./HeroVideoBg";
import StatNumber from "./StatNumber";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">

      {/* ── Full-screen video background ── */}
      <HeroVideoBg />

      {/* ── Blur layer ── */}
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />

      {/* ── Dark gradient overlay for readability ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44 text-center">

        {/* Location badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
          <MapPin size={14} className="text-white/75" />
          <span className="text-xs font-medium tracking-wide text-white/75">
            Level 2, SLN Terminus Mall, Gachibowli · Hyderabad
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Painless Dentistry.
          <br />
          <span className="text-white/55">Luxury Experience.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/70">
          Where precision meets comfort. At MySmile Lux Dental Lounge, every
          procedure is crafted for a pain-free, premium experience — because
          you deserve to leave with a smile.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:shadow-2xl hover:scale-105"
            style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
          >
            <CalendarCheck size={18} />
            Book an Appointment
          </a>
          <a
            href="tel:6304693676"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold border border-white/50 text-white transition-all hover:bg-white/15"
          >
            <Phone size={18} />
            Call: 6304693676
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap gap-10 justify-center">
          {([
            { end: 2000, suffix: "+", format: true,  label: "Root Canal Treatments" },
            { end: 5000, suffix: "+", format: true,  label: "Procedures Performed"  },
            { end: 7,    suffix: "+", format: false, label: "Years of Excellence"   },
            { end: null, static: "24×7",             label: "Care & Support"        },
          ] as const).map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              {"end" in stat && stat.end !== null ? (
                <StatNumber
                  end={stat.end as number}
                  suffix={stat.suffix as string}
                  format={stat.format as boolean}
                  duration={2200}
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "var(--font-playfair)" }}
                />
              ) : (
                <span
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {(stat as { static: string }).static}
                </span>
              )}
              <span className="text-sm mt-1 text-white/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L1440 80L1440 20C1200 60 960 80 720 60C480 40 240 0 0 20L0 80Z"
            fill="#faf9f6"
          />
        </svg>
      </div>
    </section>
  );
}
