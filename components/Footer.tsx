import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

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
            <div className="mt-6">
              <a
                href="https://instagram.com/mysmileluxdentallounge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center border"
                  style={{ borderColor: "rgba(255,255,255,0.4)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                @mysmileluxdentallounge
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
