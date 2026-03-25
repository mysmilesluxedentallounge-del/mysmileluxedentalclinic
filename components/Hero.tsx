import { Phone, MapPin, CalendarCheck } from "lucide-react";
import ClinicCarousel from "./ClinicCarousel";
import StatNumber from "./StatNumber";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--yellow-mid) 0%, var(--yellow-light) 100%)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative gold arc */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 -translate-y-1/4 translate-x-1/4"
        style={{
          background:
            "radial-gradient(circle, white 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: text content ── */}
          <div>
            {/* Location badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-black/15 bg-white/30 backdrop-blur-sm">
              <MapPin size={14} style={{ color: "var(--brand-dark)" }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: "var(--brand-dark)" }}>
                Level 2, SLN Terminus Mall, Gachibowli · Hyderabad
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
              style={{ color: "var(--brand-dark)", fontFamily: "var(--font-playfair)" }}
            >
              Painless Dentistry.
              <br />
              <span style={{ color: "var(--brand-dark)", opacity: 0.55 }}>
                Luxury Experience.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl mb-10 max-w-lg leading-relaxed" style={{ color: "var(--brand-dark)", opacity: 0.75 }}>
              Where precision meets comfort. At MySmile Lux Dental Lounge, every
              procedure is crafted for a pain-free, premium experience — because
              you deserve to leave with a smile.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:shadow-xl hover:scale-105"
                style={{
                  backgroundColor: "white",
                  color: "var(--brand-dark)",
                }}
              >
                <CalendarCheck size={18} style={{ color: "var(--brand-dark)" }} />
                Book an Appointment
              </a>
              <a
                href="tel:6304693676"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold border-2 transition-all hover:bg-white/40"
                style={{ borderColor: "var(--brand-dark)", color: "var(--brand-dark)" }}
              >
                <Phone size={18} style={{ color: "var(--brand-dark)" }} />
                Call: 6304693676
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex flex-wrap gap-8">
              {([
                { end: 2000, suffix: "+", format: true, label: "Root Canal Treatments" },
                { end: 5000, suffix: "+", format: true, label: "Procedures Performed" },
                { end: 7,    suffix: "+", format: false, label: "Years of Excellence" },
                { end: null, static: "24×7",             label: "Care & Support" },
              ] as const).map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  {"end" in stat && stat.end !== null ? (
                    <StatNumber
                      end={stat.end as number}
                      suffix={stat.suffix as string}
                      format={stat.format as boolean}
                      duration={2200}
                      className="text-3xl font-bold"
                      style={{ color: "var(--brand-dark)", fontFamily: "var(--font-playfair)" }}
                    />
                  ) : (
                    <span
                      className="text-3xl font-bold"
                      style={{ color: "var(--brand-dark)", fontFamily: "var(--font-playfair)" }}
                    >
                      {(stat as { static: string }).static}
                    </span>
                  )}
                  <span className="text-sm mt-1" style={{ color: "var(--brand-dark)", opacity: 0.65 }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: clinic video carousel ── */}
          <div className="flex items-center justify-center lg:justify-end pb-10 lg:pb-0">
            <div className="w-full max-w-xs sm:max-w-sm">
              <ClinicCarousel />
            </div>
          </div>

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
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
