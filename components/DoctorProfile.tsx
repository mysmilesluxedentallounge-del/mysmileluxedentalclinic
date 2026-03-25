import Image from "next/image";
import { Award, GraduationCap, Trophy } from "lucide-react";

const credentials = [
  {
    icon: GraduationCap,
    label: "BDS — KLE University",
    sub: "Vishwanath Kati Institute of Dental Sciences, Belgaum",
  },
  {
    icon: GraduationCap,
    label: "MDS — Conservative Dentistry & Endodontics",
    sub: "Rajiv Gandhi University of Health Sciences, Bengaluru · 7th Rank",
  },
  {
    icon: Trophy,
    label: "NEET All-India Rank 526",
    sub: "1st in Goa · 12th in Karnataka",
  },
  {
    icon: Award,
    label: "Scientific Chairperson",
    sub: "ADAI National Conference, Mangalore 2023",
  },
];

const stats = [
  { value: "2,000+", label: "Root Canals" },
  { value: "5,000+", label: "Procedures" },
  { value: "7+", label: "Years Exp." },
  { value: "AIR 526", label: "NEET Rank" },
];

export default function DoctorProfile() {
  return (
    <section id="doctor" className="py-24 overflow-hidden" style={{ backgroundColor: "var(--yellow-lightest)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Meet Your Doctor
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Dr. Shridha Prabhu
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            MDS — Conservative Dentistry & Endodontics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Photo placeholder + stats */}
          <div className="relative">
            {/* Doctor photo card */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
              <Image
                src="/doctors/Dr.Shridha_prabhu.jpg"
                alt="Dr. Shridha Prabhu"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Bottom name overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: "linear-gradient(to top, rgba(44,44,44,0.82) 0%, transparent 100%)" }}
              >
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Dr. Shridha Prabhu
                </p>
                <p className="text-sm text-white/75">
                  Founder &amp; Lead Dentist
                </p>
              </div>
            </div>

            {/* Stats overlay card */}
            <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white rounded-2xl shadow-2xl p-5 grid grid-cols-2 gap-4 w-56">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-xl font-bold"
                    style={{
                      color: "var(--brand-dark)",
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Bio & credentials */}
          <div className="lg:pl-8">
            <p className="text-gray-600 leading-relaxed mb-8 text-base">
              Dr. Shridha Prabhu is the founder and lead dentist of MySmile Lux
              Dental Lounge. With a Master&apos;s degree in Conservative Dentistry
              and Endodontics from RGUHS University (7th rank) and over{" "}
              <strong>seven years of clinical experience</strong>, she has
              transformed the dental experience for thousands of patients.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10 text-base">
              Her mission is to eliminate the stigma and fear associated with
              dental treatments by creating an approachable, comfortable, and
              luxurious environment — where every patient walks in anxious and
              walks out smiling.
            </p>

            {/* Credentials list */}
            <div className="space-y-5">
              {credentials.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "var(--yellow-mid)" }}
                    >
                      <Icon size={18} color="var(--brand-dark)" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {c.label}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{c.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href="#contact"
              className="mt-10 inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
            >
              Book with Dr. Shridha
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
