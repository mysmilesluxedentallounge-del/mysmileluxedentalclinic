import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://mysmileluxedentallounge.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "MySmile Luxe Dental Lounge | Painless Dentistry in Gachibowli",
  description:
    "MySmile Luxe Dental Lounge — luxury dental care in SLN Terminus Mall, Gachibowli. Led by Dr. Shridha Prabhu, specialist in painless dentistry, smile designing & endodontics. Book your appointment today.",
  keywords: [
    "dental clinic Gachibowli",
    "dentist Gachibowli",
    "dentist near SLN Terminus",
    "painless dentistry Hyderabad",
    "root canal specialist Gachibowli",
    "root canal treatment Hyderabad",
    "smile designing Hyderabad",
    "teeth whitening Gachibowli",
    "dental implants Hyderabad",
    "dental implants Gachibowli",
    "smile makeover Hyderabad",
    "veneers Hyderabad",
    "laser dentistry Hyderabad",
    "BPS dentures Hyderabad",
    "cosmetic dentistry Gachibowli",
    "luxury dental clinic Hyderabad",
    "MySmile Luxe Dental Lounge",
    "Dr Shridha Prabhu",
    "endodontist Hyderabad",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "MySmile Luxe Dental Lounge",
    title: "MySmile Luxe Dental Lounge | Painless Dentistry in Gachibowli",
    description:
      "Luxury dental care in SLN Terminus Mall, Gachibowli. Painless dentistry, smile designing, implants & more. Led by Dr. Shridha Prabhu.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySmile Luxe Dental Lounge — Gachibowli, Hyderabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MySmile Luxe Dental Lounge | Painless Dentistry in Gachibowli",
    description:
      "Luxury dental care in SLN Terminus Mall, Gachibowli. Painless dentistry, smile designing, implants & more.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: "MySmile Luxe Dental Lounge",
    description:
      "Luxury dental clinic in SLN Terminus Mall, Gachibowli, Hyderabad. Specialising in painless dentistry, smile designing, root canals, implants and cosmetic dentistry.",
    image: "https://mysmileluxedentallounge.com/mainlogo.png",
    url: "https://mysmileluxedentallounge.com",
    telephone: "+916304693676",
    email: "mysmileluxedentallounge@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Level 2, SLN Terminus Mall",
      addressLocality: "Gachibowli",
      addressRegion: "Telangana",
      postalCode: "500032",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.4436,
      longitude: 78.3605,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    priceRange: "₹₹₹",
    hasMap: "https://maps.app.goo.gl/MuapBb1Awx99nP3U8",
    sameAs: [
      "https://www.instagram.com/mysmileluxdentallounge",
      "https://www.linkedin.com/in/dr-shridha-prabhu/",
    ],
    medicalSpecialty: [
      "Cosmetic Dentistry",
      "Endodontics",
      "Implantology",
      "Laser Dentistry",
    ],
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
