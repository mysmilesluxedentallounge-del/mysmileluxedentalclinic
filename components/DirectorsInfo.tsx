import Image from "next/image";
import { Building2 } from "lucide-react";

const directors = [
  {
    name: "Dr. Anurag Bhavanam",
    title: "Managing Director",
    role: "General Surgeon",
    hospital: "KIMS Sunshine Hospital",
    initials: "AB",
    photo: "/doctors/DrAnuragBhavanam.jpg",
    quote:
      "Dr. Shridha's meticulous approach to dentistry is truly commendable. I wholeheartedly refer my patients to MySmile Lux Dental Lounge — the care and results are exceptional.",
  },
  {
    name: "Dr. Jhansi Pasala",
    title: "Managing Director",
    role: "Gynaecologist",
    hospital: "Jhansi Nursing Home",
    initials: "JP",
    photo: "/doctors/Dr.JhansiPasala.jpg",
    quote:
      "The level of professionalism at MySmile Lux is unmatched. Dr. Shridha combines clinical precision with genuine compassion — a rare and wonderful combination.",
  },
  {
    name: "Dr. Koti Reddy",
    title: "Managing Director",
    role: "General Surgeon",
    hospital: "Jhansi Nursing Home",
    initials: "KR",
    photo: "/doctors/Dr.KotiReddy.jpg",
    quote:
      "Dr. Shridha's commitment to ethical, minimal-invasive practice sets her apart. Every patient I've referred has returned completely satisfied.",
  },
];

export default function DirectorsInfo() {
  return (
    <section className="py-24" style={{ backgroundColor: "var(--grey-light)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--grey-mid)" }}
          >
            Industry Recognition
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Managing Directors
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            The visionary leaders who drive excellence at MySmile Lux Dental Lounge.
          </p>
        </div>

        {/* MD Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {directors.map((d) => (
            <div
              key={d.name}
              className="group flex flex-col rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Photo area — tall full-cover */}
              <div className="relative overflow-hidden" style={{ height: "340px" }}>
                <Image
                  src={d.photo}
                  alt={d.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay at bottom */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
                />
                {/* MD badge */}
                <div
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "var(--yellow-mid)", color: "var(--brand-dark)" }}
                >
                  <Building2 size={11} />
                  {d.title}
                </div>
              </div>

              {/* Info area */}
              <div className="p-5 bg-white">
                <h3
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {d.name}
                </h3>
                <p className="text-sm font-medium mt-1" style={{ color: "var(--yellow-mid)" }}>
                  {d.role}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{d.hospital}</p>
                <div
                  className="mt-4 h-[3px] w-10 rounded-full group-hover:w-20 transition-all duration-300"
                  style={{ backgroundColor: "var(--yellow-mid)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
