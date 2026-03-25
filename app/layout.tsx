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

export const metadata: Metadata = {
  title: "MySmile Lux Dental Lounge | Painless Dentistry in Gachibowli",
  description:
    "MySmile Lux Dental Lounge — luxury dental care in SLN Terminus Mall, Gachibowli. Led by Dr. Shridha Prabhu, specialist in painless dentistry, smile designing & endodontics. Book your appointment today.",
  keywords: [
    "dental clinic Gachibowli",
    "painless dentistry Hyderabad",
    "root canal treatment",
    "smile designing",
    "MySmile Lux Dental Lounge",
    "Dr Shridha Prabhu",
  ],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any", type: "image/png" },
    ],
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">{children}</body>
    </html>
  );
}
