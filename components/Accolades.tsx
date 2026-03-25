"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  {
    photo: "/achievements/AccolladesForDeliveringAGuestLectureAtRRDCH.JPG",
    title: "Guest Lecture — RRDCH",
    event: "RRDCH Bangalore",
    year: "2021",
    tag: "Faculty",
    desc: "Invited as visiting faculty and delivered a guest lecture at a premier post-graduate dental institution in Bangalore.",
  },
  {
    photo: "/achievements/AccolladesForGivingHandsOnAt3MConference.JPG",
    title: "Hands-On at 3M Conference",
    event: "3M Dental Conference",
    year: "2022",
    tag: "Workshop",
    desc: "Conducted a live hands-on session at the prestigious 3M Dental Conference for practicing clinicians.",
  },
  {
    photo: "/achievements/AsASpeakerAtNationalConferenceForSmileDesigning.JPG",
    title: "Speaker — Smile Designing",
    event: "National Smile Design Conference",
    year: "2022",
    tag: "Speaker",
    desc: "Delivered an expert talk on digital smile design workflows to 200+ dental professionals nationwide.",
  },
  {
    photo: "/achievements/Dr. PresentingTheAwardsToTheWinnerPGCategory.JPG",
    title: "Presenting PG Category Awards",
    event: "National Dental Convention",
    year: "2023",
    tag: "Leadership",
    desc: "Honoured to present awards to outstanding post-graduate winners at a national dental convention.",
  },
  {
    photo: "/achievements/fellowshipInLaserCosmeticDentistry.JPG",
    title: "Fellowship — Laser Cosmetic Dentistry",
    event: "Academy of Laser Dentistry",
    year: "2023",
    tag: "Fellowship",
    desc: "Awarded fellowship in Laser Cosmetic Dentistry, recognising advanced competency in laser procedures.",
  },
  {
    photo: "/achievements/receivingAwardForHerPaperPresentation AtNationalConference.JPG",
    title: "Award — Paper Presentation",
    event: "National Dental Conference",
    year: "2020",
    tag: "Research",
    desc: "Received award for best paper presentation on advanced obturation techniques at a national conference.",
  },
  {
    photo: "/achievements/HercontinouscontributionsduringCovid19.JPG",
    title: "Covid-19 Contribution",
    event: "Community Health Initiative",
    year: "2020",
    tag: "Contribution",
    desc: "Recognised for continuous contributions during the Covid-19 pandemic, providing essential dental care to patients in need.",
  },
];

export default function Accolades() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const getOffset = (index: number) => {
    let d = index - current;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  return (
    <section
      className="py-24 overflow-hidden"
      style={{ backgroundColor: "var(--yellow-lightest)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Recognition &amp; Awards
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
          >
            Accolades &amp; Honours
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "var(--grey-mid)" }}>
            Dr. Shridha Prabhu is nationally recognised for contributions to
            modern dentistry, smile designing, and clinical education.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center" style={{ height: "460px" }}>

          {/* Cards */}
          {items.map((item, index) => {
            const offset = getOffset(index);
            const isCenter = offset === 0;
            const isAdjacentL = offset === -1;
            const isVisible = Math.abs(offset) <= 1;

            if (!isVisible) return null;

            const scale = isCenter ? 1 : 0.72;
            const zIndex = isCenter ? 20 : 10;
            const opacity = isCenter ? 1 : 0.55;
            const translateX = isCenter
              ? "0%"
              : isAdjacentL
              ? "-78%"
              : "78%";

            return (
              <div
                key={item.title}
                onClick={() => !isCenter && setCurrent(index)}
                className="absolute rounded-3xl overflow-hidden shadow-xl"
                style={{
                  width: "min(520px, 88vw)",
                  transform: `translateX(${translateX}) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: "all 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                {/* Photo area */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: isCenter ? "300px" : "240px",
                    transition: "height 0.55s ease",
                  }}
                >
                  <Image
                    src={item.photo}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 90vw, 520px"
                  />
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%)" }}
                  />
                  {/* Year badge */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                  >
                    {item.year}
                  </div>
                  {/* Tag badge */}
                  <div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(255,255,255,0.85)", color: "var(--grey-dark)" }}
                  >
                    {item.tag}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6" style={{ backgroundColor: "white" }}>
                  <h3
                    className="font-bold mb-1"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "var(--brand-dark)",
                      fontSize: isCenter ? "1.25rem" : "1rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="font-medium text-sm mb-3"
                    style={{ color: "var(--yellow-mid)" }}
                  >
                    {item.event}
                  </p>
                  {isCenter && (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--grey-mid)" }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          {/* Prev button */}
          <button
            onClick={prev}
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:shadow-md active:scale-95"
            style={{ borderColor: "var(--yellow-mid)", backgroundColor: "white", color: "var(--brand-dark)" }}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "28px" : "8px",
                  height: "8px",
                  backgroundColor: i === current ? "var(--yellow-mid)" : "var(--grey-light)",
                  border: i === current ? "none" : "1px solid var(--grey-mid)",
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:shadow-md active:scale-95"
            style={{ borderColor: "var(--yellow-mid)", backgroundColor: "white", color: "var(--brand-dark)" }}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-6 max-w-xs mx-auto h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--grey-light)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${((current + 1) / total) * 100}%`,
              backgroundColor: "var(--yellow-mid)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--grey-mid)" }}>
          {current + 1} / {total}
        </p>
      </div>
    </section>
  );
}
