import { services } from "@/lib/services"
import { CLINIC, DOCTOR, HOME_FAQS } from "@/lib/site-seo"

/**
 * /llms.txt — the emerging standard (llmstxt.org) that gives AI answer engines
 * (ChatGPT, Claude, Perplexity, Gemini) a clean, authoritative summary of the
 * business. Improves AEO/GEO by making accurate facts easy to cite.
 */
export const dynamic = "force-static"

export function GET() {
  const { address } = CLINIC
  const servicesList = services
    .map((service) => `- [${service.name}](${CLINIC.url}/services/${service.slug}): ${service.metaDescription}`)
    .join("\n")

  const faqList = HOME_FAQS.map((faq) => `- **${faq.question}** ${faq.answer}`).join("\n")

  const body = `# ${CLINIC.name}

> Luxury dental clinic in SLN Terminus Mall, Gachibowli, Hyderabad, India — specialising in painless dentistry, smile designing, root canal treatment, dental implants and cosmetic dentistry. Led by ${DOCTOR.name} (${DOCTOR.qualification}).

${CLINIC.name} offers premium, comfort-first dental care with modern technology and strict sterilisation protocols. Appointments can be booked online or by phone.

## Clinic details
- Name: ${CLINIC.name}
- Lead dentist: ${DOCTOR.name} — ${DOCTOR.jobTitle}
- Address: ${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}, India
- Phone: ${CLINIC.phoneDisplay}
- Email: ${CLINIC.email}
- Hours: ${CLINIC.hours.days[0]}–${CLINIC.hours.days[CLINIC.hours.days.length - 1]}, ${CLINIC.hours.opens}–${CLINIC.hours.closes}
- Website: ${CLINIC.url}
- Map: ${CLINIC.map}
- Areas served: Gachibowli, Financial District, Kondapur, and greater Hyderabad

## Book an appointment
- [Book online](${CLINIC.url}/book): Request an appointment; the clinic confirms your slot by phone.

## Services
${servicesList}

## Frequently asked questions
${faqList}

## Social
${CLINIC.socials.map((url) => `- ${url}`).join("\n")}
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
