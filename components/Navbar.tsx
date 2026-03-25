"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Doctor", href: "#doctor" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm border-b border-gray-100 ${scrolled ? "shadow-md" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <Image
              src="/mainlogo.png"
              alt="MySmile Lux Dental Lounge"
              width={612}
              height={408}
              style={{ height: "120px", width: "auto", mixBlendMode: "multiply" }}
              priority
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[var(--brand-dark)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:6304693676"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--brand-dark)] transition-colors"
            >
              <Phone size={15} />
              6304693676
            </a>
            <a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
              style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
            >
              Book Appointment
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={22} color="var(--brand-dark)" />
            ) : (
              <Menu size={22} color="var(--brand-dark)" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-[var(--brand-dark)]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 px-5 py-3 rounded-full text-sm font-semibold text-center"
              style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
            >
              Book Appointment
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
