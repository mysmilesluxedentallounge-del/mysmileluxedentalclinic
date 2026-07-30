/**
 * Central marketing-site facts + structured-data builders.
 * Powers SEO (JSON-LD), AEO/GEO (llms.txt, AI-crawler rules) and the visible FAQ,
 * so everything stays consistent from one source of truth.
 */

import { services } from "@/lib/services"

export const CLINIC = {
  name: "MySmile Luxe Dental Lounge",
  legalName: "MySmile Luxe Dental Lounge",
  url: "https://mysmileluxedentallounge.com",
  logo: "https://mysmileluxedentallounge.com/mainlogo.png",
  image: "https://mysmileluxedentallounge.com/og-image.png",
  phone: "+916304693676",
  phoneDisplay: "+91 63046 93676",
  email: "mysmileluxedentallounge@gmail.com",
  priceRange: "₹₹₹",
  map: "https://maps.app.goo.gl/MuapBb1Awx99nP3U8",
  address: {
    streetAddress: "Level 2, SLN Terminus Mall",
    addressLocality: "Gachibowli",
    addressRegion: "Telangana",
    postalCode: "500032",
    addressCountry: "IN",
  },
  geo: { latitude: 17.4436, longitude: 78.3605 },
  hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "20:00" },
  socials: [
    "https://www.instagram.com/mysmileluxdentallounge",
    "https://www.linkedin.com/in/dr-shridha-prabhu/",
  ],
  specialties: ["Cosmetic Dentistry", "Endodontics", "Implantology", "Laser Dentistry"],
} as const

export const DOCTOR = {
  name: "Dr. Shridha Prabhu",
  qualification: "BDS, MDS",
  jobTitle: "Chief Dental Surgeon & Endodontist",
  bio: "Dr. Shridha Prabhu is the lead dentist at MySmile Luxe Dental Lounge, specialising in painless dentistry, root canal treatment, smile designing and cosmetic dentistry.",
  linkedin: "https://www.linkedin.com/in/dr-shridha-prabhu/",
} as const

/** Homepage FAQ — single source used by the FAQ component and FAQPage schema. */
export const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: "What are the signs that I might need a root canal?",
    answer:
      "Signs you might need a root canal include severe tooth pain, prolonged tooth sensitivity to hot or cold, gum swelling, darkening of the tooth, and tenderness when chewing.",
  },
  {
    question: "What is the process for getting dental implants at MySmile?",
    answer:
      "At MySmile, getting dental implants involves a consultation, implant placement, a healing period for bone integration, and then fitting the abutment and crown.",
  },
  {
    question: "Can I get invisible aligners at MySmile?",
    answer:
      "Yes, MySmile offers invisible aligners across various leading brands, tailored to your teeth alignment needs and lifestyle. Our team will assess your case and recommend the best option for you.",
  },
  {
    question: "What types of braces does MySmile offer?",
    answer:
      "MySmile offers various types of braces including traditional metal braces, ceramic braces (tooth-colored) & clear aligners like Invisalign, tailored to individual needs.",
  },
  {
    question: "What safety measures are in place at MySmile?",
    answer:
      "At MySmile, we follow stringent safety protocols including radiation safety and a multi-step sterilization process for all instruments, ensuring a safe and hygienic environment for every patient.",
  },
  {
    question: "How do I cancel or reschedule my appointment?",
    answer:
      "To cancel or reschedule your appointment, contact our clinic directly at +91 6304693676 or reach us via email at mysmileluxedentallounge@gmail.com. Our team will be happy to assist you.",
  },
]

const clinicNode = {
  "@type": ["Dentist", "LocalBusiness", "MedicalBusiness"],
  "@id": `${CLINIC.url}/#clinic`,
  name: CLINIC.name,
  legalName: CLINIC.legalName,
  description:
    "Luxury dental clinic in SLN Terminus Mall, Gachibowli, Hyderabad. Specialising in painless dentistry, smile designing, root canals, implants and cosmetic dentistry.",
  url: CLINIC.url,
  logo: CLINIC.logo,
  image: CLINIC.image,
  telephone: CLINIC.phone,
  email: CLINIC.email,
  priceRange: CLINIC.priceRange,
  hasMap: CLINIC.map,
  currenciesAccepted: "INR",
  address: { "@type": "PostalAddress", ...CLINIC.address },
  geo: { "@type": "GeoCoordinates", latitude: CLINIC.geo.latitude, longitude: CLINIC.geo.longitude },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: CLINIC.hours.days,
      opens: CLINIC.hours.opens,
      closes: CLINIC.hours.closes,
    },
  ],
  areaServed: [
    { "@type": "City", name: "Hyderabad" },
    { "@type": "Place", name: "Gachibowli" },
    { "@type": "Place", name: "Financial District, Hyderabad" },
    { "@type": "Place", name: "Kondapur" },
  ],
  medicalSpecialty: CLINIC.specialties,
  sameAs: [...CLINIC.socials, CLINIC.map],
}

/** JSON-LD @graph for the homepage: clinic + website + doctor + FAQ. */
export function buildHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${CLINIC.url}/#website`,
        url: CLINIC.url,
        name: CLINIC.name,
        publisher: { "@id": `${CLINIC.url}/#clinic` },
        inLanguage: "en-IN",
      },
      clinicNode,
      {
        "@type": "Physician",
        "@id": `${CLINIC.url}/#dr-shridha`,
        name: DOCTOR.name,
        jobTitle: DOCTOR.jobTitle,
        description: DOCTOR.bio,
        medicalSpecialty: CLINIC.specialties,
        worksFor: { "@id": `${CLINIC.url}/#clinic` },
        sameAs: [DOCTOR.linkedin],
      },
      {
        "@type": "FAQPage",
        "@id": `${CLINIC.url}/#faq`,
        mainEntity: HOME_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  }
}

/** JSON-LD for a single service page: MedicalProcedure + Service + FAQ. */
export function buildServiceJsonLd(slug: string) {
  const service = services.find((item) => item.slug === slug)
  if (!service) return null
  const serviceUrl = `${CLINIC.url}/services/${service.slug}`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalProcedure", "Service"],
        "@id": `${serviceUrl}/#service`,
        name: service.name,
        description: service.metaDescription,
        url: serviceUrl,
        procedureType: "https://schema.org/NoninvasiveProcedure",
        provider: { "@id": `${CLINIC.url}/#clinic` },
        areaServed: { "@type": "City", name: "Hyderabad" },
      },
      service.faqs.length
        ? {
            "@type": "FAQPage",
            "@id": `${serviceUrl}/#faq`,
            mainEntity: service.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }
        : null,
    ].filter(Boolean),
  }
}

/** Serialise JSON-LD safely for embedding in a <script> tag. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
