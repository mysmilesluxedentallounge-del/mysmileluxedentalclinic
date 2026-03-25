"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const VIDEOS = [
  "/clinic/IMG_1214.MOV",
  "/clinic/IMG_1215.MOV",
  "/clinic/IMG_1216.MOV",
  "/clinic/IMG_1219.MOV",
  "/clinic/IMG_1220.MOV",
];

export default function ClinicCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      const prev = current;
      setIsTransitioning(true);

      const prevVideo = videoRefs.current[prev];
      if (prevVideo) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }

      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [current, isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % VIDEOS.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + VIDEOS.length) % VIDEOS.length);
  }, [current, goTo]);

  /* Play current video when it becomes active */
  useEffect(() => {
    const video = videoRefs.current[current];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [current]);

  return (
    <div className="relative w-full select-none">
      {/* Card shell */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          border: "2px solid rgba(201,168,76,0.35)",
          background: "#111",
          aspectRatio: "9/16",
          maxHeight: "72vh",
        }}
      >
        {/* Videos */}
        {VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={(el) => { videoRefs.current[i] = el; }}
            src={src}
            muted
            playsInline
            preload="metadata"
            onEnded={i === current ? next : undefined}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: "none" }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)",
          }}
        />

        {/* Prev / Next buttons */}
        <button
          onClick={prev}
          aria-label="Previous video"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
        >
          <ChevronLeft size={18} color="white" />
        </button>
        <button
          onClick={next}
          aria-label="Next video"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
        >
          <ChevronRight size={18} color="white" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to video ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                background: i === current ? "#c9a84c" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>

        {/* Counter badge */}
        <div
          className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
        >
          {current + 1} / {VIDEOS.length}
        </div>
      </div>

      {/* Decorative glow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 blur-2xl opacity-40 pointer-events-none rounded-full"
        style={{ background: "#c9a84c" }}
      />
    </div>
  );
}
