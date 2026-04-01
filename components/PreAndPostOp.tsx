"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
    image: "/preAndpostOp/beforeAndAfter3.png",
    title: "Complete Transformation",
    treatment: "Smile Design",
  },
  {
    image: "/preAndpostOp/beforeAndAfter4.png",
    title: "Confidence Restored",
    treatment: "Full Smile Design",
  },
    {
    image: "/preAndpostOp/beforeAndAfter5.jpeg",
    title: "Smile Makeover",
    treatment: "Veneers",
  },
];

function Card({ c, large = false, active = false, onClick }: { c: (typeof cases)[0]; large?: boolean; active?: boolean; onClick?: () => void }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group w-full h-full"
      onClick={onClick}
      style={{ outline: active && !large ? "2px solid var(--yellow-mid)" : "none" }}
    >
      <Image
        src={c.image}
        alt={c.title}
        fill
        className="object-contain transition-transform duration-700 group-hover:scale-105"
        sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 opacity-60 group-hover:opacity-90"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 55%)" }}
      />

      {/* Badge */}
      <div className="absolute top-3 left-3">
        <span
          className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
        >
          Before &amp; After
        </span>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p
          className={`text-white font-bold leading-tight ${large ? "text-lg" : "text-sm"}`}
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {c.title}
        </p>
        <p
          className="text-xs mt-1 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          style={{ color: "var(--yellow-mid)" }}
        >
          {c.treatment}
        </p>
      </div>
    </div>
  );
}

export default function PreAndPostOp() {
  const [featured, setFeatured] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFeatured((prev) => (prev + 1) % cases.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-24" style={{ backgroundColor: "#111827" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
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
          <h2
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            <span className="text-white">Before </span>
            <span style={{ color: "var(--yellow-mid)" }}>&amp;</span>
            <span className="text-white"> After</span>
          </h2>
          <p
            className="mt-4 text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Authentic patient transformations from our clinic —<br />
            no filters, no edits, just real smiles.
          </p>
        </div>

        {/* Editorial grid: featured left + 2×2 right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ height: "600px" }}>

          {/* Featured — left, full height */}
          <div className="h-full" style={{ backgroundColor: "#0a0a0a", borderRadius: "1rem", overflow: "hidden" }}>
            <Card c={cases[featured]} large />
          </div>

          {/* Thumbnail grid right — 2 cols, 3 rows; 5th spans full width */}
          <div className="grid grid-cols-2 gap-3 h-full" style={{ gridTemplateRows: "1fr 1fr 0.7fr" }}>
            {cases.slice(0, 4).map((c, i) => (
              <Card
                key={i}
                c={c}
                active={featured === i}
                onClick={() => setFeatured(i)}
              />
            ))}
            <div className="col-span-2">
              <Card
                c={cases[4]}
                active={featured === 4}
                onClick={() => setFeatured(4)}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
