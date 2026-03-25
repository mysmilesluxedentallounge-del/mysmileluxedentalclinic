import { Phone, MapPin, CalendarCheck } from "lucide-react";

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-3xl">
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-black/15 bg-white/30 backdrop-blur-sm">
            <MapPin size={14} style={{ color: "var(--brand-dark)" }} />
            <span className="text-xs font-medium tracking-wide" style={{ color: "var(--brand-dark)" }}>
              Level 2, SLN Terminus Mall, Gachibowli · Hyderabad
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ color: "var(--brand-dark)", fontFamily: "var(--font-playfair)" }}
          >
            Painless Dentistry.
            <br />
            <span style={{ color: "var(--brand-dark)", opacity: 0.55 }}>
              Luxury Experience.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed" style={{ color: "var(--brand-dark)", opacity: 0.75 }}>
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
          <div className="mt-16 flex flex-wrap gap-10">
            {[
              { value: "2,000+", label: "Root Canal Treatments" },
              { value: "5,000+", label: "Procedures Performed" },
              { value: "7+", label: "Years of Excellence" },
              { value: "24×7", label: "Care & Support" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--brand-dark)",
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {stat.value}
                </span>
                <span className="text-sm mt-1" style={{ color: "var(--brand-dark)", opacity: 0.65 }}>{stat.label}</span>
              </div>
            ))}
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
