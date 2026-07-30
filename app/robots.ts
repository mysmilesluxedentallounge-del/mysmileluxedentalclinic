import { MetadataRoute } from "next";

const BASE_URL = "https://mysmileluxedentallounge.com";

// AI answer-engine / training crawlers we explicitly welcome (GEO/AEO).
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Search engines + everyone else: full access, keep the private app out.
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/api/"],
      },
      {
        // AI answer engines: allow the public marketing content so the clinic
        // can be cited accurately by ChatGPT, Claude, Perplexity, Gemini, etc.
        userAgent: AI_CRAWLERS,
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard", "/login", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
