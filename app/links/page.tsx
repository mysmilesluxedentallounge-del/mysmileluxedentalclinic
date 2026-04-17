import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "MySmile Luxe Dental Lounge | Links",
  description:
    "Enquire about our dental services, book a free consultation, or find us on social media.",
  alternates: {
    canonical: "https://mysmileluxedentallounge.com/links",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mysmileluxedentallounge.com/links",
    siteName: "MySmile Luxe Dental Lounge",
    title: "MySmile Luxe Dental Lounge | Links",
    description:
      "Enquire about our dental services, book a free consultation, or find us on social media.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySmile Luxe Dental Lounge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MySmile Luxe Dental Lounge | Links",
    description: "Enquire about our dental services, book a free consultation, or find us on social media.",
    images: ["/og-image.png"],
  },
};

const WHATSAPP_NUMBER = "916304693676";
const PHONE_NUMBER = "6304693676";

function whatsappLink(service: string) {
  const msg = encodeURIComponent(
    `Hi, I'm interested in ${service} at MySmile Luxe Dental Lounge. Please share more details.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

const services = [
  { name: "Smile Designing",      icon: "/svgs/white-teeth.png"       },
  { name: "Veneers",              icon: "/svgs/protection.png"         },
  { name: "Teeth Whitening",      icon: "/svgs/sensitive.png"          },
  { name: "Cosmetic Fillings",    icon: "/svgs/bad-teeth.png"          },
  { name: "Dental Implants",      icon: "/svgs/dental-implant.png"     },
  { name: "Crowns & Bridges",     icon: "/svgs/dental-prosthesis.png"  },
  { name: "BPS Dentures",         icon: "/svgs/broken-tooth.png"       },
  { name: "Full Mouth Rehab",     icon: "/svgs/medical-assistance.png" },
  { name: "Teeth Cleaning",       icon: "/svgs/dental-care.png"        },
  { name: "Painless Root Canals", icon: "/svgs/infection.png"          },
  { name: "Surgical Extractions", icon: "/svgs/tooth-extraction.png"   },
  { name: "Laser Dentistry",      icon: "/svgs/dentalchair.webp"       },
];

function WhatsAppIcon({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={size === "sm" ? "w-3 h-3 flex-shrink-0" : "w-5 h-5 flex-shrink-0"}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function LinksPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ background: "#ffffff" }}
    >
      <div className="relative w-full max-w-xl flex flex-col items-center gap-8">

        {/* ── Logo + Title ── */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: "1.5px solid rgba(201,168,76,0.35)",
              boxShadow: "0 0 32px rgba(201,168,76,0.18)",
            }}
          >
            <Image
              src="/mainlogo.png"
              alt="MySmile Luxe Dental Lounge"
              width={72}
              height={72}
              className="rounded-full object-contain"
            />
          </div>
          <div className="text-center">
          <h1
            className="text-2xl font-bold leading-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#2c2c2c",
              letterSpacing: "0.01em",
            }}
          >
              MySmile Luxe
              <br />
              Dental Lounge
            </h1>
            <p className="mt-1.5 text-xs tracking-[0.2em] uppercase" style={{ color: "#c9a84c" }}>
              Gachibowli, Hyderabad
            </p>
          </div>
        </div>

        {/* ── Gold Divider ── */}
        <Divider />

        {/* ── For Enquiry Section ── */}
        <section className="w-full flex flex-col items-center gap-4">
          <SectionLabel>For Enquiry</SectionLabel>
          <div className="w-full grid grid-cols-3 gap-3">
            {services.map((service) => (
              <a
                key={service.name}
                href={whatsappLink(service.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2.5 px-3 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-center"
                style={{
                  background: "#faf9f6",
                  border: "1px solid rgba(201,168,76,0.25)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                >
                  <Image
                    src={service.icon}
                    alt={service.name}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-xs font-semibold leading-tight"
                  style={{ color: "#2c2c2c" }}
                >
                  {service.name}
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(37,211,102,0.1)",
                    color: "#25d366",
                    border: "1px solid rgba(37,211,102,0.22)",
                  }}
                >
                  <WhatsAppIcon size="sm" />
                  Enquire
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Gold Divider ── */}
        <Divider />

        {/* ── Free Consultation ── */}
        <section className="w-full flex flex-col items-center gap-4">
          <SectionLabel>Book Your Home Consultation — No Need to Travel This Hot Summer</SectionLabel>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.08) 100%)",
              border: "1.5px solid rgba(201,168,76,0.45)",
              boxShadow: "0 4px 20px rgba(201,168,76,0.12)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#c9a84c" }}
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.3a16 16 0 0 0 5.8 5.8l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.16z" />
            </svg>
            <span
              className="text-lg font-bold tracking-wider"
              style={{ fontFamily: "var(--font-inter)", color: "#2c2c2c" }}
            >
              +91 {PHONE_NUMBER}
            </span>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to book a free consultation at MySmile Luxe Dental Lounge.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(37,211,102,0.10)",
              border: "1.5px solid rgba(37,211,102,0.3)",
            }}
          >
            <WhatsAppIcon />
            <span className="text-sm font-semibold" style={{ color: "#25d366" }}>
              WhatsApp to Book Consultation
            </span>
          </a>
        </section>

        {/* ── Gold Divider ── */}
        <Divider />

        {/* ── Social Media ── */}
        <section className="w-full flex flex-col items-center gap-4">
          <SectionLabel>Watch Us On</SectionLabel>
          <div className="flex items-center gap-3 w-full">
            <a
              href="https://www.instagram.com/mysmileluxedentallounge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, rgba(225,48,108,0.07) 0%, rgba(253,121,7,0.05) 100%)",
                border: "1px solid rgba(225,48,108,0.2)",
              }}
            >
              <span style={{ color: "#e1306c" }}>
                <InstagramIcon />
              </span>
              <span className="text-xs font-semibold" style={{ color: "#2c2c2c" }}>
                Instagram
              </span>
            </a>
            <a
              href="https://www.youtube.com/@Mysmilesluxedentallounge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "rgba(255,0,0,0.06)",
                border: "1px solid rgba(255,0,0,0.18)",
              }}
            >
              <span style={{ color: "#ff0000" }}>
                <YouTubeIcon />
              </span>
              <span className="text-xs font-semibold" style={{ color: "#2c2c2c" }}>
                YouTube
              </span>
            </a>
            <a
              href="https://www.linkedin.com/company/mysmile-luxe-dental-lounge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "rgba(10,102,194,0.07)",
                border: "1px solid rgba(10,102,194,0.2)",
              }}
            >
              <span style={{ color: "#0a66c2" }}>
                <LinkedInIcon />
              </span>
              <span className="text-xs font-semibold" style={{ color: "#2c2c2c" }}>
                LinkedIn
              </span>
            </a>
          </div>
        </section>

        {/* ── Gold Divider ── */}
        <Divider />

        {/* ── Google Map ── */}
        <section className="w-full flex flex-col items-center gap-4">
          <SectionLabel>Find Us</SectionLabel>
          <p className="text-xs text-center" style={{ color: "#7a7a7a" }}>
            Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032
          </p>
          <div
            className="w-full overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(201,168,76,0.2)", height: "260px" }}
          >
            <iframe
              title="MySmile Luxe Dental Lounge Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.2537090026893!2d78.36050!3d17.44360!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93e7ad8c3a1b%3A0x1a2b3c4d5e6f7a8b!2sSLN+Terminus+Mall%2C+Gachibowli!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* ── Footer note ── */}
        <p
          className="text-center text-xs pb-4"
          style={{ color: "#b0b0b0", letterSpacing: "0.05em" }}
        >
          © MySmile Luxe Dental Lounge
        </p>
      </div>
    </main>
  );
}

function Divider() {
  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.18)" }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(201,168,76,0.4)" }} />
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.18)" }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold tracking-[0.12em] uppercase text-center leading-relaxed"
      style={{ color: "#c9a84c" }}
    >
      {children}
    </p>
  );
}
