"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

type ReviewLength = "short" | "medium" | "long";

const reviews: {
  name: string; rating: number; date: string; review: string;
  treatment: string; initials: string;
  avatarColor: string; isFeatured: boolean; reviewLength: ReviewLength;
}[] = [
  { name: "Chintu Sadula",        rating: 5, date: "2 months ago",  review: "Absolutely recommend Dr. Shridha for consultation. Got my treatment, it was painless and everything was explained well.",                                                                                                                                  treatment: "Consultation",           initials: "CS", avatarColor: "#4F46E5", isFeatured: false, reviewLength: "short"  },
  { name: "Prathyusha Chalumuri", rating: 5, date: "2 weeks ago",   review: "Had a great experience with Dr. Shridha. Explained everything clearly and did the cleaning very well.",                                                                                                                                                       treatment: "Dental Cleaning",        initials: "PC", avatarColor: "#9333EA", isFeatured: false, reviewLength: "short"  },
  { name: "Ekta Kumari",          rating: 5, date: "3 weeks ago",   review: "Had a very great experience with Dr. Shridha Prabhu. Explained every minute detail, very friendly and empathetic.",                                                                                                                                           treatment: "Consultation",           initials: "EK", avatarColor: "#059669", isFeatured: false, reviewLength: "medium" },
  { name: "Sohan Kumar M",        rating: 5, date: "3 weeks ago",   review: "I consulted Dr. Shridha for scaling and didn't get any pain during the procedure.",                                                                                                                                                                          treatment: "Scaling",                initials: "SK", avatarColor: "#EF4444", isFeatured: false, reviewLength: "short"  },
  { name: "Prasanth Kumar",       rating: 5, date: "a month ago",   review: "Had a great experience at my dental appointment for cleaning and consultation. Dr. Shridha was extremely professional, gentle, and thorough throughout the procedure. She explained everything clearly and made me feel completely at ease.",                   treatment: "Cleaning & Consultation",initials: "PK", avatarColor: "#F59E0B", isFeatured: true,  reviewLength: "long"   },
  { name: "Valsweet",             rating: 5, date: "2 months ago",  review: "Had a great experience with tooth scaling. The procedure was done very smoothly and with great care.",                                                                                                                                                        treatment: "Scaling",                initials: "V",  avatarColor: "#0EA5E9", isFeatured: false, reviewLength: "short"  },
  { name: "Venkat Sai",           rating: 5, date: "a month ago",   review: "Dr. Shridha Prabhu is tremendously skilled and did her job well. Guided me nicely and gave useful precautions. Truly a doctor who cares about her patients beyond just the procedure.",                                                                       treatment: "General Dentistry",      initials: "VS", avatarColor: "#8B5CF6", isFeatured: true,  reviewLength: "long"   },
  { name: "Gayathri Gollamandala",rating: 5, date: "a month ago",   review: "Everything done was really good. Dr. Shridha was very friendly and explained everything clearly.",                                                                                                                                                           treatment: "General Dentistry",      initials: "GG", avatarColor: "#EC4899", isFeatured: false, reviewLength: "short"  },
  { name: "Gurpreet Singh Bawa",  rating: 5, date: "a month ago",   review: "It was a truly positive experience. Dr. Shridha was very beneficial and explained everything clearly.",                                                                                                                                                       treatment: "Consultation",           initials: "GB", avatarColor: "#3B82F6", isFeatured: false, reviewLength: "medium" },
  { name: "Deevang Kumawat",      rating: 5, date: "a month ago",   review: "Dr. Shridha explained the procedure properly and made sure I was comfortable at every step.",                                                                                                                                                                 treatment: "General Dentistry",      initials: "DK", avatarColor: "#10B981", isFeatured: false, reviewLength: "short"  },
  { name: "Manohar Mano",         rating: 5, date: "a month ago",   review: "Highly recommend! The dental doctor was fantastic — super professional, gentle, and explained everything clearly.",                                                                                                                                            treatment: "General Dentistry",      initials: "MM", avatarColor: "#F97316", isFeatured: false, reviewLength: "medium" },
  { name: "Abhishek Bakal",       rating: 5, date: "a month ago",   review: "It was a pretty good experience with Dr. Shridha. She explained the issue very well and gave helpful recommendations.",                                                                                                                                       treatment: "Consultation",           initials: "AB", avatarColor: "#6366F1", isFeatured: false, reviewLength: "medium" },
  { name: "Vishnu Vardhan",       rating: 5, date: "a month ago",   review: "It was a good experience, painless and smooth treatment done by Dr. Shridha Prabhu.",                                                                                                                                                                        treatment: "Dental Treatment",       initials: "VV", avatarColor: "#7C3AED", isFeatured: false, reviewLength: "short"  },
  { name: "Sanjay Kumar",         rating: 5, date: "a month ago",   review: "Nice treatment and the doctor explained everything very clearly. Thank you so much.",                                                                                                                                                                         treatment: "General Dentistry",      initials: "SK", avatarColor: "#EF4444", isFeatured: false, reviewLength: "short"  },
  { name: "Greeshma G",           rating: 5, date: "a month ago",   review: "Came for cleaning. Dr. Shridha was kind and made me feel comfortable. Overall a good experience.",                                                                                                                                                            treatment: "Cleaning",               initials: "GG", avatarColor: "#059669", isFeatured: false, reviewLength: "short"  },
  { name: "Leeladhar Cherukuri",  rating: 5, date: "7 months ago",  review: "Exceptional dental care! Dr. Shridha was thorough, gentle, and explained everything clearly throughout the process. I felt completely at ease and well cared for. The results exceeded my expectations. Highly recommend.",                                  treatment: "Dental Care",            initials: "LC", avatarColor: "#0891B2", isFeatured: true,  reviewLength: "long"   },
  { name: "Harsha C",             rating: 5, date: "11 months ago", review: "Clinic is clean and well-managed. Dr. Shridha was patient and extremely professional.",                                                                                                                                                                      treatment: "General Dentistry",      initials: "HC", avatarColor: "#D97706", isFeatured: false, reviewLength: "short"  },
  { name: "Vinay M H",            rating: 5, date: "7 months ago",  review: "Great experience. Dr. Shridha explained every step clearly. The procedure was done with care and professionalism.",                                                                                                                                           treatment: "Dental Cleaning",        initials: "VM", avatarColor: "#7C3AED", isFeatured: false, reviewLength: "medium" },
];

const CARDS_PER_PAGE = 6;

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
  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const [page, setPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((p: number) => setPage((p + totalPages) % totalPages), [totalPages]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setPage((p) => (p + 1) % totalPages), 6000);
  }, [totalPages]);

  useEffect(() => {
    resetTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetTimer]);

  const handleNav = (dir: number) => { goTo(page + dir); resetTimer(); };

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span
              className="text-xs font-semibold tracking-[0.25em] uppercase"
              style={{ color: "var(--grey-mid)" }}
            >
              Patient Experiences
            </span>
            <h2
              className="mt-2 text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-dark)" }}
            >
              What Our Patients Say
            </h2>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleNav(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(i); resetTimer(); }}
                  aria-label={`Page ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: "6px",
                    width: i === page ? "22px" : "6px",
                    backgroundColor: i === page ? "var(--yellow-mid)" : "#d1d5db",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => handleNav(1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel track */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => (
              <div
                key={pageIdx}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-shrink-0 w-full"
              >
                {reviews
                  .slice(pageIdx * CARDS_PER_PAGE, (pageIdx + 1) * CARDS_PER_PAGE)
                  .map((r) => (
                    <div
                      key={r.name}
                      className="relative rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 h-[230px]"
                      style={
                        r.isFeatured
                          ? { backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }
                          : { backgroundColor: "white", border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
                      }
                    >
                      {/* Quote icon */}
                      <Quote
                        size={28}
                        className="absolute top-5 right-5 opacity-10"
                        style={{ color: r.isFeatured ? "var(--yellow-mid)" : "var(--brand-dark)" }}
                      />

                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
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
                            className="text-xs mt-0.5"
                            style={{ color: r.isFeatured ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
                          >
                            {r.date}
                          </p>
                        </div>
                      </div>

                      <StarRating rating={r.rating} />

                      <p
                        className="mt-3 leading-relaxed flex-1 overflow-hidden line-clamp-3"
                        style={{
                          fontSize: "0.75rem",
                          color: r.isFeatured ? "rgba(255,255,255,0.78)" : "#4b5563",
                        }}
                      >
                        {r.review}
                      </p>

                      <div className="mt-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={
                            r.isFeatured
                              ? { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }
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
      </div>
    </section>
  );
}
