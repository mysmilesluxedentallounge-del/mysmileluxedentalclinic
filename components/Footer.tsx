import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { CLINIC_SOCIAL } from "@/lib/social-links";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Doctor", href: "#doctor" },
  { label: "Book Appointment", href: "#contact" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#3a3a3a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/mainlogo.png"
                alt="MySmile Lux Dental Lounge"
                width={612}
                height={408}
                style={{ height: "160px", width: "auto" }}
              />
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Redefining dental care with luxury, precision, and compassion.
              Enter as a patient — leave as a friend.
            </p>

            {/* Social */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={CLINIC_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border transition-opacity hover:opacity-70"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.85)" }}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={CLINIC_SOCIAL.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border transition-opacity hover:opacity-70"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.85)" }}
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href={CLINIC_SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border transition-opacity hover:opacity-70"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.85)" }}
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4
              className="font-bold text-sm uppercase tracking-widest mb-6"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-60 flex items-center gap-2"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4
              className="font-bold text-sm uppercase tracking-widest mb-6"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Contact
            </h4>
            <div className="space-y-4">
              <a
                href="tel:6304693676"
                className="flex items-start gap-3 transition-opacity hover:opacity-70"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <Phone size={15} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">6304693676</span>
              </a>
              <a
                href="mailto:mysmileluxedentallounge@gmail.com"
                className="flex items-start gap-3 transition-opacity hover:opacity-70"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <Mail size={15} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm break-all">mysmileluxedentallounge@gmail.com</span>
              </a>
              <div className="flex items-start gap-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Level 2, SLN Terminus Mall,<br />
                  Gachibowli, Hyderabad 500032
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider + copyright */}
        <div
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} MySmile Lux Dental Lounge. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Led by Dr. Shridha Prabhu · MDS Endodontics · RGUHS
          </p>
        </div>
      </div>
    </footer>
  );
}
