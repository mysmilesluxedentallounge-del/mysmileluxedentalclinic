"use client";

import Image from "next/image";
import { useState } from "react";

const cases = [
  {
    image: "/preAndpostOp/beforeAndAfter.jpeg",
    title: "Smile Makeover",
    treatment: "Veneers & Whitening",
  },
  {
    image: "/preAndpostOp/beforeAndAfter2.jpeg",
    title: "Dental Restoration",
    treatment: "Composite Bonding",
  },
  {
    image: "/preAndpostOp/beforeAndAfter3.PNG",
    title: "Complete Transformation",
    treatment: "Smile Design",
  },
  {
    image: "/preAndpostOp/beforeAndAfter4.PNG",
    title: "Confidence Restored",
    treatment: "Full Smile Design",
  },
];

export default function PreAndPostOp() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-24" style={{ backgroundColor: "#111827" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          {/* Overline with decorative rules */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex-1 max-w-[80px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.4)" }} />
            <span
              className="text-xs font-semibold tracking-[0.3em] uppercase"
              style={{ color: "var(--yellow-mid)" }}
            >
              Real Results
            </span>
            <span className="flex-1 max-w-[80px] h-px" style={{ backgroundColor: "rgba(201,168,76,0.4)" }} />
          </div>

          {/* Two-tone headline */}
          <h2
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            <span className="text-white">Before </span>
            <span style={{ color: "var(--yellow-mid)" }}>&amp;</span>
            <span className="text-white"> After</span>
          </h2>

          {/* Subtitle */}
          <p
            className="mt-4 text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Authentic patient transformations from our clinic —<br />
            no filters, no edits, just real smiles.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cases.map((c, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ height: "400px" }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)",
                  opacity: active === i ? 1 : 0.7,
                }}
              />

              {/* Treatment badge — top left */}
              <div className="absolute top-4 left-4">
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                >
                  Before &amp; After
                </span>
              </div>

              {/* Info — bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
              >
                <p
                  className="text-white font-bold text-base"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {c.title}
                </p>
                <p
                  className="text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: "var(--yellow-mid)" }}
                >
                  {c.treatment}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
