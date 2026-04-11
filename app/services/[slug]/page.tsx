import type { Metadata, PageProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { services, getServiceBySlug } from "@/lib/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  const url = `https://mysmileluxedentallounge.com/services/${slug}`;
  return {
    title: `${service.name} | MySmile Luxe Dental Lounge`,
    description: service.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: "MySmile Luxe Dental Lounge",
      title: `${service.name} | MySmile Luxe Dental Lounge`,
      description: service.metaDescription,
      images: [
        {
          url: service.heroImage,
          width: 1200,
          height: 630,
          alt: `${service.name} at MySmile Luxe Dental Lounge`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.name} | MySmile Luxe Dental Lounge`,
      description: service.metaDescription,
      images: [service.heroImage],
    },
  };
}

const WHATSAPP_NUMBER = "916304693676";

function whatsappLink(service: string) {
  const msg = encodeURIComponent(
    `Hi, I'm interested in ${service} at MySmile Luxe Dental Lounge. Please share more details.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

export default async function ServicePage(
  props: PageProps<"/services/[slug]">
) {
  const { slug } = await props.params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    description: service.metaDescription,
    image: service.heroImage,
    procedureType: "https://health-lifesci.schema.org/TherapeuticProcedure",
    followup: "Follow-up appointment at MySmile Luxe Dental Lounge.",
    howPerformed: service.intro,
    preparation: "Book a consultation at MySmile Luxe Dental Lounge, Gachibowli.",
    provider: {
      "@type": "Dentist",
      name: "MySmile Luxe Dental Lounge",
      url: "https://mysmileluxedentallounge.com",
      telephone: "+916304693676",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Level 2, SLN Terminus Mall",
        addressLocality: "Gachibowli",
        addressRegion: "Telangana",
        postalCode: "500032",
        addressCountry: "IN",
      },
    },
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-30 w-full border-b"
        style={{ background: "#ffffff", borderColor: "rgba(201,168,76,0.18)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#2c2c2c" }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/mainlogo.png"
              alt="MySmile Luxe Dental Lounge"
              width={28}
              height={28}
              className="rounded-full object-contain"
            />
            <span
              className="hidden sm:block text-xs font-semibold"
              style={{ color: "#2c2c2c", fontFamily: "var(--font-playfair)" }}
            >
              MySmile Luxe Dental Lounge
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative w-full h-72 sm:h-96 overflow-hidden">
        <Image
          src={service.heroImage}
          alt={service.name}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-end pb-10 text-center px-4">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-2"
            style={{ color: "#c9a84c" }}
          >
            Our Services
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {service.name}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl">
            {service.tagline}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Intro + CTA ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-5">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
            >
              What is {service.name}?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#4a4a4a" }}>
              {service.intro}
            </p>
          </div>

          {/* CTA Card */}
          <div
            className="rounded-2xl p-6 space-y-4 sticky top-20"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <Image
                src={service.icon}
                alt={service.name}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <p
              className="text-center text-base font-semibold"
              style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
            >
              Interested in {service.name}?
            </p>
            <a
              href={whatsappLink(service.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "#25d366", color: "#ffffff" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </a>
            <Link
              href="/book"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(201,168,76,0.1)",
                color: "#2c2c2c",
                border: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              Book Appointment
            </Link>
            <a
              href="tel:6304693676"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ color: "#7a7a7a" }}
            >
              <Phone size={14} />
              +91 6304693676
            </a>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section>
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <CheckCircle2
                  size={18}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "#c9a84c" }}
                />
                <p className="text-sm leading-relaxed" style={{ color: "#3d3d3d" }}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process ── */}
        <section>
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Our Process
          </h2>
          <div className="relative">
            {/* vertical line */}
            <div
              className="absolute left-5 top-0 bottom-0 w-px hidden sm:block"
              style={{ background: "rgba(201,168,76,0.2)" }}
            />
            <div className="space-y-6">
              {service.process.map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold z-10"
                    style={{
                      background: "#ffffff",
                      border: "2px solid #c9a84c",
                      color: "#c9a84c",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="flex-1 rounded-2xl p-5"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(201,168,76,0.15)",
                    }}
                  >
                    <p
                      className="text-sm font-bold mb-1"
                      style={{ color: "#2c2c2c", fontFamily: "var(--font-playfair)" }}
                    >
                      {step.step}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#7a7a7a" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section>
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {service.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: "#2c2c2c" }}
                >
                  {faq.q}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#7a7a7a" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Other services ── */}
        <section>
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Explore Other Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {services
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover:scale-[1.03]"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                >
                  <Image
                    src={s.icon}
                    alt={s.name}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <span className="text-xs font-semibold" style={{ color: "#2c2c2c" }}>
                    {s.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        {/* ── Bottom CTA banner ── */}
        <section
          className="rounded-3xl px-8 py-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.04) 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          <p
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair)", color: "#2c2c2c" }}
          >
            Ready to get started?
          </p>
          <p className="text-sm mb-6" style={{ color: "#7a7a7a" }}>
            Book a free consultation with our experts and take the first step towards your best smile.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/book"
              className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#c9a84c", color: "#ffffff" }}
            >
              Book Appointment
            </Link>
            <a
              href={whatsappLink(service.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{
                background: "rgba(37,211,102,0.1)",
                color: "#25d366",
                border: "1px solid rgba(37,211,102,0.3)",
              }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer
        className="py-5 text-center text-xs border-t"
        style={{ borderColor: "rgba(201,168,76,0.15)", color: "#b0b0b0", background: "#ffffff" }}
      >
        © MySmile Luxe Dental Lounge · Level 2, SLN Terminus Mall, Gachibowli, Hyderabad
      </footer>
    </main>
  );
}
