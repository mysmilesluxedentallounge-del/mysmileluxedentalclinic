import type { Metadata } from "next"

const PREDICT_URL = "https://predict.mysmileluxedentallounge.com"

export const metadata: Metadata = {
  title: "Free Smile Predictor | MySmile Luxe Dental Lounge",
  description:
    "See what professional teeth whitening could do for your smile in under a minute. Free, instant and private — your photo never leaves your phone. MySmile Luxe Dental Lounge, Gachibowli.",
  keywords: [
    "smile predictor",
    "teeth whitening preview",
    "virtual smile makeover",
    "smile simulation Hyderabad",
    "teeth whitening Gachibowli",
    "free smile check",
    "MySmile Luxe Dental Lounge",
  ],
  alternates: {
    canonical: PREDICT_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: PREDICT_URL,
    siteName: "MySmile Luxe Dental Lounge",
    title: "Free Smile Predictor | MySmile Luxe Dental Lounge",
    description:
      "Snap a photo and see your brighter smile instantly. Free, private, and ready in under a minute.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Smile Predictor | MySmile Luxe Dental Lounge",
    description: "See your brighter smile before you book. Free and instant.",
  },
}

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return children
}
