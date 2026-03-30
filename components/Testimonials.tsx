"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

const videos = [
  { src: "/testimonials/clientVideo1.mp4", label: "Patient Story" },
  { src: "/testimonials/clientVideo2.mp4", label: "Patient Smile" },
  { src: "/testimonials/clientVideo3.mp4", label: "Patient Story" },
];

const CARD_WIDTH = 340;   // px — portrait card width
const CARD_HEIGHT = 604;  // px — 9:16 portrait (340 × 16/9 ≈ 604)
const GAP = 20;           // px — gap between cards

export default function Testimonials() {
  const total = videos.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const measure = () => setContainerW(containerRef.current?.offsetWidth ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const prev = useCallback(() => { setCurrent((c) => (c - 1 + total) % total); setMuted(true); }, [total]);
  const next = useCallback(() => { setCurrent((c) => (c + 1) % total); setMuted(true); }, [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) {
        v.currentTime = 0;
        v.muted = muted;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [current, muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const vid = videoRefs.current[current];
      if (vid) vid.muted = !m;
      return !m;
    });
  }, [current]);

  // Center active card: offset = half container - half card - current * (card + gap)
  const translateX = containerW / 2 - CARD_WIDTH / 2 - current * (CARD_WIDTH + GAP);

  return (
    <section
      className="py-24"
      style={{ backgroundColor: "var(--grey-light)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Patient Stories
          </span>
          <h2
            className="mt-2 text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
          >
            Hear From Our Patients
          </h2>
        </div>

        {/* Carousel — overflow hidden clips side peeks at container edge */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ height: CARD_HEIGHT }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track */}
          <div
            className="absolute top-0 flex transition-transform duration-700 ease-in-out"
            style={{ gap: GAP, transform: `translateX(${translateX}px)` }}
          >
            {videos.map((v, i) => {
              const isActive = i === current;
              return (
                <div
                  key={i}
                  className="relative flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    opacity: isActive ? 1 : 0.45,
                    transform: isActive ? "scale(1)" : "scale(0.94)",
                  }}
                  onClick={() => { if (!isActive) { setCurrent(i); setMuted(true); } }}
                >
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={v.src}
                    muted={muted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}
                  />
                  {/* Label — only on active */}
                  {isActive && (
                    <div className="absolute bottom-14 left-6 right-6">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                        style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                      >
                        Patient Story
                      </span>
                      <p
                        className="text-white font-bold text-lg"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {v.label}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Left arrow — positioned over the left peek area */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
            style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "white" }}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
            style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "white" }}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          {/* Mute toggle — bottom-centre of active card */}
          <button
            onClick={toggleMute}
            className="absolute bottom-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.45)",
              color: "white",
            }}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Dot indicators — below the carousel */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setMuted(true); }}
              aria-label={`Video ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                height: "6px",
                width: i === current ? "22px" : "6px",
                backgroundColor: i === current ? "var(--yellow-mid)" : "#d1d5db",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
