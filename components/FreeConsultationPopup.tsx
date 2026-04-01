"use client";

import { useEffect, useRef, useState } from "react";
import { X, User, Phone, RefreshCw } from "lucide-react";
import Image from "next/image";

function genCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function FreeConsultationPopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePopup = () => {
    timerRef.current = setTimeout(() => setVisible(true), 20000);
  };

  useEffect(() => {
    schedulePopup();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setName("");
    setPhone("");
    setConsent(false);
    setSubmitted(false);
    setCaptcha(genCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
    schedulePopup();
  };

  const refreshCaptcha = () => {
    setCaptcha(genCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true);
      refreshCaptcha();
      return;
    }
    if (!consent) return;
    setLoading(true);
    try {
      await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setSubmitted(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fadeInScale"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 text-center border-b"
          style={{ backgroundColor: "#ffffff", borderColor: "rgba(201,168,76,0.25)" }}
        >
          <Image
            src="/mainlogo.png"
            alt="MySmile Lux Dental Lounge"
            width={160}
            height={52}
            className="object-contain mx-auto"
          />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-7" style={{ backgroundColor: "#fdf9ed" }}>
          {submitted ? (
            <div className="py-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                We&apos;ll Call You Back!
              </h3>
              <p className="text-sm text-gray-500">Our team will reach out shortly. See you soon!</p>
              <button
                onClick={dismiss}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2
                className="text-xl font-bold text-gray-900 text-center leading-snug mb-1"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Didn&apos;t Find What You Were Looking for!
              </h2>
              <p className="text-sm text-center font-semibold text-gray-600 mb-5">
                Get a call back from our Expert Dentist
              </p>

              {/* Name */}
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User size={15} color="var(--yellow-mid)" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Name*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Phone */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Phone size={15} color="var(--yellow-mid)" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Phone*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Math Captcha */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Solve to verify: <strong className="text-gray-800">{captcha.a} + {captcha.b} = ?</strong></p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Your answer"
                    value={captchaInput}
                    onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                    className="flex-1 px-4 py-2.5 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700 placeholder-gray-400"
                    style={{ borderColor: captchaError ? "#ef4444" : "#e5e7eb" }}
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition hover:scale-110"
                    style={{ backgroundColor: "rgba(201,168,76,0.15)" }}
                    aria-label="Refresh captcha"
                  >
                    <RefreshCw size={14} color="var(--yellow-mid)" />
                  </button>
                </div>
                {captchaError && (
                  <p className="text-xs text-red-500 mt-1.5">Incorrect answer — please try again.</p>
                )}
              </div>

              {/* Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-yellow-500 w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I hereby consent to receive calls/messages from MySmile Lux Dental Lounge and its partners.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !consent}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
              >
                {loading ? "Submitting…" : "Submit"}
              </button>
            </form>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center transition hover:scale-110"
          style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
          aria-label="Close"
        >
          <X size={14} color="white" />
        </button>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
