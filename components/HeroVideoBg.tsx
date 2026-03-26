"use client";

import { useRef, useEffect, useState } from "react";

const VIDEOS = [
  "/clinic/IMG_1214.MOV",
  "/clinic/IMG_1215.MOV",
  "/clinic/IMG_1216.MOV",
  "/clinic/IMG_1219.MOV",
  "/clinic/IMG_1220.MOV",
];

export default function HeroVideoBg() {
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const activeSlotRef = useRef(0);
  const indexRef = useRef(0);
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    const refs = [ref0, ref1];

    const loadAndPlay = (el: HTMLVideoElement, src: string) => {
      el.src = src;
      el.load();
      el.playbackRate = 0.5;
      return el.play().catch(() => {});
    };

    const crossfade = () => {
      const nextIndex = (indexRef.current + 1) % VIDEOS.length;
      const nextSlot = activeSlotRef.current === 0 ? 1 : 0;
      const nextEl = refs[nextSlot].current;
      if (!nextEl) return;

      loadAndPlay(nextEl, VIDEOS[nextIndex]).then(() => {
        activeSlotRef.current = nextSlot;
        indexRef.current = nextIndex;
        setActiveSlot(nextSlot);
      });
    };

    const el0 = refs[0].current;
    const el1 = refs[1].current;
    if (!el0 || !el1) return;

    loadAndPlay(el0, VIDEOS[0]);
    el0.addEventListener("ended", crossfade);
    el1.addEventListener("ended", crossfade);

    return () => {
      el0.removeEventListener("ended", crossfade);
      el1.removeEventListener("ended", crossfade);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* ── Desktop: all 5 videos side by side, each looping ── */}
      <div className="hidden md:flex w-full h-full">
        {VIDEOS.map((src) => (
          <video
            key={src}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            ref={(el) => { if (el) el.playbackRate = 0.5; }}
            className="flex-1 min-w-0 h-full object-cover"
          />
        ))}
      </div>

      {/* ── Mobile: double-buffered, opacity via React state (no direct DOM mutation) ── */}
      <div className="md:hidden absolute inset-0">
        <video
          ref={ref0}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[600ms]"
          style={{ opacity: activeSlot === 0 ? 1 : 0 }}
        />
        <video
          ref={ref1}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[600ms]"
          style={{ opacity: activeSlot === 1 ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
