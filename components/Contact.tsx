"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function Contact() {
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
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) years--;
    return years >= 0 ? years : null;
  })();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    <section
      id="contact"
      className="py-24"
      style={{ backgroundColor: "var(--grey-light)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Book an Appointment
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Book an Appointment
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Ready for a pain-free dental experience? Fill in the form and our
            team will reach out to confirm your slot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: "var(--yellow-mid)" }}
                >
                  <Send size={28} color="var(--brand-dark)" />
                </div>
                <h3
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Request Received!
                </h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Thank you! A confirmation receipt has been sent to{" "}
                  <span className="font-semibold text-gray-700">{form.email}</span>.
                  Our team will also call you shortly to confirm your slot.
                </p>
              </div>
            ) : (
              <form data-booking-form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={
                      {
                        "--tw-ring-color": "var(--brand-teal)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-dob" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      id="contact-dob"
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all text-gray-700"
                    />
                    {age !== null && (
                      <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--brand-teal)" }}>
                        Age: {age} year{age !== 1 ? "s" : ""} old
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-gender" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender *
                    </label>
                    <select
                      id="contact-gender"
                      name="gender"
                      required
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-white text-gray-700"
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    id="contact-date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message / Concern
                  </label>
                  <textarea
                    id="contact-message"
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
                  style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                >
                  <Send size={16} />
                  {loading ? "Sending…" : "Book Appointment"}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-8">
            {/* Info cards */}
            <div className="space-y-4">
              {[
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
                  value:
                    "Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032",
                  href: "https://maps.google.com/?q=SLN+Terminus+Mall+Gachibowli+Hyderabad",
                },
              ].map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                  >
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

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={
                      item.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            {/* Map embed placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-75 bg-gray-100 flex items-center justify-center">
              <iframe
                title="MySmile Lux Dental Lounge Location"
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
    </section>
  );
}
