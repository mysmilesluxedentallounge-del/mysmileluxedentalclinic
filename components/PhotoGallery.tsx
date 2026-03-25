import Image from "next/image";
import { Star } from "lucide-react";

const celebrities = [
  {
    name: "Nagarjuna",
    file: "/actors/withNagarjuna.JPG",
    width: 1206,
    height: 2297,
  },
  {
    name: "Nani",
    file: "/actors/withNani.JPG",
    width: 624,
    height: 1204,
  },
  {
    name: "Rashmika Mandanna",
    file: "/actors/withRashmika.JPG",
    width: 742,
    height: 1259,
  },
  {
    name: "Regina Cassandra",
    file: "/actors/withRegina.JPG",
    width: 586,
    height: 1243,
  },
  {
    name: "Vijay Devarakonda",
    file: "/actors/withVijayDevarakonda.JPG",
    width: 977,
    height: 1515,
  },
];

export default function PhotoGallery() {
  return (
    <section className="py-24" style={{ backgroundColor: "var(--brand-dark)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--yellow-mid)" }}
          >
            Our Celebrity Clients
          </span>
          <h2
            className="mt-3 text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Celebrity Interactions
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Trusted by stars — Dr. Shridha Prabhu&apos;s expertise and care has won
            the smiles of some of India&apos;s most celebrated personalities.
          </p>
        </div>

        {/* Tall portrait grid — 5 columns desktop, 3 tablet, 2 mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {celebrities.map((celeb) => (
            <div
              key={celeb.name}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: "3/5" }}
            >
              {/* Photo */}
              <Image
                src={celeb.file}
                alt={`Dr. Shridha with ${celeb.name}`}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                }}
              />

              {/* Star badge */}
              <div
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--yellow-mid)" }}
              >
                <Star size={13} fill="var(--brand-dark)" color="var(--brand-dark)" />
              </div>

              {/* Name label */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p
                  className="text-white font-bold text-sm leading-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {celeb.name}
                </p>
                <p
                  className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: "var(--yellow-mid)" }}
                >
                  with Dr. Shridha Prabhu
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
