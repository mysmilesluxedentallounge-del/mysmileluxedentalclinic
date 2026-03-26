"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { Star, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

const mediaItems = [
  { type: "video" as const, src: "/testimonials/clientVideo1.mp4", label: "Client Story" },
  { type: "video" as const, src: "/testimonials/clientVideo2.mp4", label: "Client Smile" },
  { type: "video" as const, src: "/testimonials/clientVideo3.mp4", label: "Client Story" },
  { type: "image" as const, src: "/testimonials/beforeAndAfter.jpeg", label: "Before & After" },
  { type: "image" as const, src: "/testimonials/firstclient.jpeg", label: "Client Smile" },
  { type: "image" as const, src: "/testimonials/beforeAndAfter2.jpeg", label: "Before & After" },
  { type: "image" as const, src: "/testimonials/beforeAndAfter3.jpeg", label: "Before & After" },
  { type: "image" as const, src: "/testimonials/beforeAndAfter2.jpeg", label: "Before & After" },
];

type ReviewLength = "short" | "medium" | "long";

const reviews: {
  name: string; rating: number; date: string; review: string;
  treatment: string; initials: string;
  avatarColor: string; isFeatured: boolean; reviewLength: ReviewLength;
}[] = [
  {
    name: "Chintu Sadula",
    rating: 5, date: "2 months ago",
    review: "Absolutely recommend Dr. Shridha for consultation. Got my treatment, it was painless and everything was explained well.",
    treatment: "Consultation", initials: "CS",
    avatarColor: "#4F46E5", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Prathyusha Chalumuri",
    rating: 5, date: "2 weeks ago",
    review: "Had a great experience with Dr. Shridha. Explained everything clearly and did the cleaning very well.",
    treatment: "Dental Cleaning", initials: "PC",
    avatarColor: "#9333EA", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Ekta Kumari", 
    rating: 5, date: "3 weeks ago",
    review: "Had a very great experience with Dr. Shridha Prabhu. Explained every minute detail, very friendly and empathetic.",
    treatment: "Consultation", initials: "EK",
    avatarColor: "#059669", isFeatured: false, reviewLength: "medium",
  },
  {
    name: "Sohan Kumar M",
    rating: 5, date: "3 weeks ago",
    review: "I consulted Dr. Shridha for scaling and didn't get any pain during the procedure.",
    treatment: "Scaling", initials: "SK",
    avatarColor: "#EF4444", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Prasanth Kumar",
    rating: 5, date: "a month ago",
    review: "Had a great experience at my dental appointment for cleaning and consultation. Dr. Shridha was extremely professional, gentle, and thorough throughout the procedure. She explained everything clearly and made me feel completely at ease.",
    treatment: "Cleaning & Consultation", initials: "PK",
    avatarColor: "#F59E0B", isFeatured: true, reviewLength: "long",
  },
  {
    name: "Valsweet",
    rating: 5, date: "2 months ago",
    review: "Had a great experience with tooth scaling. The procedure was done very smoothly and with great care.",
    treatment: "Scaling", initials: "V",
    avatarColor: "#0EA5E9", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Venkat Sai",
    rating: 5, date: "a month ago",
    review: "Dr. Shridha Prabhu is tremendously skilled and did her job well. Guided me nicely and gave useful precautions. Truly a doctor who cares about her patients beyond just the procedure.",
    treatment: "General Dentistry", initials: "VS",
    avatarColor: "#8B5CF6", isFeatured: true, reviewLength: "long",
  },
  {
    name: "Gayathri Gollamandala",
    rating: 5, date: "a month ago",
    review: "Everything done was really good. Dr. Shridha was very friendly and explained everything clearly.",
    treatment: "General Dentistry", initials: "GG",
    avatarColor: "#EC4899", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Gurpreet Singh Bawa",
    rating: 5, date: "a month ago",
    review: "It was a truly positive experience. Dr. Shridha was very beneficial and explained everything clearly.",
    treatment: "Consultation", initials: "GB",
    avatarColor: "#3B82F6", isFeatured: false, reviewLength: "medium",
  },
  {
    name: "Deevang Kumawat",
    rating: 5, date: "a month ago",
    review: "Dr. Shridha explained the procedure properly and made sure I was comfortable at every step.",
    treatment: "General Dentistry", initials: "DK",
    avatarColor: "#10B981", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Manohar Mano",
    rating: 5, date: "a month ago",
    review: "Highly recommend! The dental doctor was fantastic — super professional, gentle, and explained everything clearly.",
    treatment: "General Dentistry", initials: "MM",
    avatarColor: "#F97316", isFeatured: false, reviewLength: "medium",
  },
  {
    name: "Abhishek Bakal",
    rating: 5, date: "a month ago",
    review: "It was a pretty good experience with Dr. Shridha. She explained the issue very well and gave helpful recommendations.",
    treatment: "Consultation", initials: "AB",
    avatarColor: "#6366F1", isFeatured: false, reviewLength: "medium",
  },
  {
    name: "Vishnu Vardhan",
    rating: 5, date: "a month ago",
    review: "It was a good experience, painless and smooth treatment done by Dr. Shridha Prabhu.",
    treatment: "Dental Treatment", initials: "VV",
    avatarColor: "#7C3AED", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Sanjay Kumar",
    rating: 5, date: "a month ago",
    review: "Nice treatment and the doctor explained everything very clearly. Thank you so much.",
    treatment: "General Dentistry", initials: "SK",
    avatarColor: "#EF4444", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Greeshma G",
    rating: 5, date: "a month ago",
    review: "Came for cleaning. Dr. Shridha was kind and made me feel comfortable. Overall a good experience.",
    treatment: "Cleaning", initials: "GG",
    avatarColor: "#059669", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Leeladhar Cherukuri",
    rating: 5, date: "7 months ago",
    review: "Exceptional dental care! Dr. Shridha was thorough, gentle, and explained everything clearly throughout the process. I felt completely at ease and well cared for. The results exceeded my expectations. Highly recommend.",
    treatment: "Dental Care", initials: "LC",
    avatarColor: "#0891B2", isFeatured: true, reviewLength: "long",
  },
  {
    name: "Harsha C",
    rating: 5, date: "11 months ago",
    review: "Clinic is clean and well-managed. Dr. Shridha was patient and extremely professional.",
    treatment: "General Dentistry", initials: "HC",
    avatarColor: "#D97706", isFeatured: false, reviewLength: "short",
  },
  {
    name: "Vinay M H",
    rating: 5, date: "7 months ago",
    review: "Great experience. Dr. Shridha explained every step clearly. The procedure was done with care and professionalism.",
    treatment: "Dental Cleaning", initials: "VM",
    avatarColor: "#7C3AED", isFeatured: false, reviewLength: "medium",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? "var(--brand-gold)" : "none"}
          stroke={i < rating ? "var(--brand-gold)" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const total = mediaItems.length;

  const reviewsPerPage = 6;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const [reviewPage, setReviewPage] = useState(0);

  const prev = useCallback(() => { setCurrent((c) => (c - 1 + total) % total); setMuted(true); }, [total]);
  const next = useCallback(() => { setCurrent((c) => (c + 1) % total); setMuted(true); }, [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  useEffect(() => {
    const t = setInterval(() => {
      setReviewPage((p) => (p + 1) % totalPages);
    }, 7000);
    return () => clearInterval(t);
  }, [totalPages]);

  useEffect(() => {
    if (mediaItems[current].type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = muted;
      videoRef.current.play().catch(() => {});
    }
  }, [current, muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  }, []);

  const safeCurrent = Math.min(current, total - 1);

  return (
    <section className="py-24" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Patient Experiences
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            What Our Patients Say
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 items-start">

          {/* LEFT — vertical media carousel */}
          <div
            className="relative rounded-3xl overflow-hidden select-none"
            style={{ height: "740px" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Slides */}
            {mediaItems.map((item, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: i === safeCurrent ? 1 : 0,
                  transform: i === safeCurrent ? "translateY(0)" : i < safeCurrent ? "translateY(-100%)" : "translateY(100%)",
                  pointerEvents: i === safeCurrent ? "auto" : "none",
                }}
              >
                {item.type === "video" ? (
                  <video
                    ref={i === safeCurrent ? videoRef : undefined}
                    src={item.src}
                    autoPlay
                    muted={i !== safeCurrent ? true : muted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={i === 0}
                  />
                )}
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 55%)" }}
                />
                {/* Label */}
                <div className="absolute bottom-16 left-5 right-5">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                    style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                  >
                    {item.type === "video" ? "Client Story" : "Happy Client"}
                  </span>
                  <p
                    className="text-white font-bold text-lg"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}

            {/* Up/Down controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
                style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white" }}
                aria-label="Previous"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
                style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white" }}
                aria-label="Next"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Dot indicators — vertical strip */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
              {mediaItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setMuted(true); }}
                  aria-label={`Slide ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: "6px",
                    height: i === safeCurrent ? "24px" : "6px",
                    backgroundColor: i === safeCurrent ? "var(--yellow-mid)" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>

            {/* Mute toggle — only shown on video slides */}
            {mediaItems[safeCurrent]?.type === "video" && (
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110"
                style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "white" }}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}

            {/* Counter */}
            <div
              className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold z-10"
              style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "white" }}
            >
              {safeCurrent + 1} / {total}
            </div>
          </div>

          {/* RIGHT — horizontal grid carousel (2 cards/page, 7s) */}
          <div className="flex flex-col gap-4">
            {/* Sliding window */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${reviewPage * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0 w-full"
                  >
                    {reviews
                      .slice(pageIdx * reviewsPerPage, (pageIdx + 1) * reviewsPerPage)
                      .map((r) => (
                        <div
                          key={r.name}
                          className="rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1"
                          style={
                            r.isFeatured
                              ? { backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }
                              : { backgroundColor: "white", border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                          }
                        >
                          {/* Quote mark for featured */}
                          {r.isFeatured && (
                            <span
                              className="block text-4xl leading-none mb-1 -mt-1"
                              style={{ color: "var(--yellow-mid)", fontFamily: "Georgia, serif" }}
                            >
                              &ldquo;
                            </span>
                          )}

                          {/* Header */}
                          <div className="flex items-center gap-2.5 mb-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                              style={{ backgroundColor: r.avatarColor }}
                            >
                              {r.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: r.isFeatured ? "white" : "#111827" }}
                              >
                                {r.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: r.isFeatured ? "rgba(255,255,255,0.45)" : "#9ca3af" }}
                              >
                                {r.date}
                              </p>
                            </div>
                          </div>

                          <StarRating rating={r.rating} />

                          <p
                            className="mt-2.5 leading-relaxed flex-1"
                            style={{
                              fontSize: r.reviewLength === "long" ? "0.8rem" : "0.72rem",
                              color: r.isFeatured ? "rgba(255,255,255,0.82)" : "#4b5563",
                            }}
                          >
                            {r.review}
                          </p>

                          <div className="mt-3">
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={
                                r.isFeatured
                                  ? { backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }
                                  : { backgroundColor: "var(--yellow-lightest)", color: "var(--brand-dark)" }
                              }
                            >
                              {r.treatment}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Page controls: prev — dots — next */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setReviewPage((p) => (p - 1 + totalPages) % totalPages)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewPage(i)}
                    aria-label={`Page ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height: "7px",
                      width: i === reviewPage ? "24px" : "7px",
                      backgroundColor: i === reviewPage ? "var(--yellow-mid)" : "#d1d5db",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setReviewPage((p) => (p + 1) % totalPages)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                aria-label="Next reviews"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
