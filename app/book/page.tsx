"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 6304693676",
    href: "tel:6304693676",
  },
  {
    icon: Mail,
    label: "Email",
    value: "mysmileluxedentallounge@gmail.com",
    href: "mailto:mysmileluxedentallounge@gmail.com",
  },
  {
    icon: MapPin,
    label: "Clinic Address",
    value: "Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032",
    href: "https://maps.google.com/?q=SLN+Terminus+Mall+Gachibowli+Hyderabad",
  },
];

export default function BookPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    date: "",
    message: "",
  });

  const age = (() => {
    if (!form.dob) return null;
    const today = new Date();
    const birth = new Date(form.dob);
    if (isNaN(birth.getTime())) return null;
    let years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate()))
      years--;
    return years >= 0 ? years : null;
  })();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f8f7f4" }}
    >
      {/* Top bar */}
      <header
        className="w-full py-5 px-6 flex items-center justify-center gap-3 border-b"
        style={{
          background: "#ffffff",
          borderColor: "rgba(201,168,76,0.2)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          <Image
            src="/mainlogo.png"
            alt="MySmile Luxe Dental Lounge"
            width={32}
            height={32}
            className="rounded-full object-contain"
          />
        </div>
        <div>
          <p
            className="text-sm font-bold leading-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#2c2c2c",
            }}
          >
            MySmile Luxe Dental Lounge
          </p>
          <p
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "#c9a84c" }}
          >
            Gachibowli, Hyderabad
          </p>
        </div>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Page heading */}
        <div className="text-center mb-10">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#c9a84c" }}
          >
            Schedule a Visit
          </span>
          <h1
            className="mt-2 text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Book an Appointment
          </h1>
          <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "#7a7a7a" }}>
            Ready for a pain-free dental experience? Fill in the form and our
            team will reach out to confirm your slot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Form ── */}
          <div
            className="rounded-3xl p-7 sm:p-8"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(201,168,76,0.15)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: "var(--yellow-mid)" }}
                >
                  <Send size={28} color="var(--brand-dark)" />
                </div>
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Request Received!
                </h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  Thank you! A confirmation receipt has been sent to{" "}
                  <span className="font-semibold text-gray-700">
                    {form.email}
                  </span>
                  . Our team will also call you shortly to confirm your slot.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="book-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="book-name"
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "var(--brand-teal)" } as React.CSSProperties}
                  />
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="book-dob" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      id="book-dob"
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all text-gray-700"
                    />
                    {age !== null && (
                      <p
                        className="mt-1.5 text-xs font-medium"
                        style={{ color: "var(--brand-teal)" }}
                      >
                        Age: {age} year{age !== 1 ? "s" : ""} old
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="book-gender" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender *
                    </label>
                    <select
                      id="book-gender"
                      name="gender"
                      required
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-white text-gray-700"
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="book-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="book-phone"
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="book-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="book-email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                </div>

                {/* Preferred date */}
                <div>
                  <label htmlFor="book-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    id="book-date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all text-gray-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="book-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message / Concern
                  </label>
                  <textarea
                    id="book-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your dental concern or query..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--yellow-mid)",
                    color: "var(--brand-dark)",
                  }}
                >
                  <Send size={16} />
                  {loading ? "Sending…" : "Book Appointment"}
                </button>
              </form>
            )}
          </div>

          {/* ── Right column: contact info + map ── */}
          <div className="space-y-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              const card = (
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--yellow-mid)" }}
                  >
                    <Icon size={18} color="var(--brand-dark)" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              );

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {card}
                </a>
              );
            })}

            {/* Map */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                height: "280px",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              <iframe
                title="MySmile Luxe Dental Lounge Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.2537090026893!2d78.36050!3d17.44360!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93e7ad8c3a1b%3A0x1a2b3c4d5e6f7a8b!2sSLN+Terminus+Mall%2C+Gachibowli!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-5 text-center text-xs border-t"
        style={{
          borderColor: "rgba(201,168,76,0.15)",
          color: "#b0b0b0",
          background: "#ffffff",
        }}
      >
        © MySmile Luxe Dental Lounge · Level 2, SLN Terminus Mall, Gachibowli, Hyderabad
      </footer>
    </main>
  );
}
