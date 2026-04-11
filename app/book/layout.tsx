import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment | MySmile Luxe Dental Lounge",
  description:
    "Book your dental appointment at MySmile Luxe Dental Lounge, Gachibowli. Painless dentistry, smile designing, implants & more. Easy online booking.",
  alternates: {
    canonical: "https://mysmileluxedentallounge.com/book",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mysmileluxedentallounge.com/book",
    siteName: "MySmile Luxe Dental Lounge",
    title: "Book an Appointment | MySmile Luxe Dental Lounge",
    description:
      "Book your dental appointment at MySmile Luxe Dental Lounge, Gachibowli. Painless dentistry, smile designing, implants & more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Book an Appointment at MySmile Luxe Dental Lounge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book an Appointment | MySmile Luxe Dental Lounge",
    description:
      "Book your dental appointment at MySmile Luxe Dental Lounge, Gachibowli.",
    images: ["/og-image.png"],
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
