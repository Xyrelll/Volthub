import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "Smart Cities Energy Solutions - VoltHub",
  description: "Integrated energy infrastructure for modern cities. Street lighting, EV charging networks, and microgrid systems for sustainable urban development.",
  keywords: [
    "smart cities energy",
    "urban energy solutions",
    "smart city infrastructure",
    "EV charging networks",
    "smart street lighting",
    "microgrid systems",
    "sustainable urban development",
    "smart city energy",
    "VoltHub smart cities",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/sectors/smart-cities`,
    siteName: "VoltHub Energy",
    title: "Smart Cities Energy Solutions - VoltHub",
    description: "Integrated energy infrastructure for modern cities. Street lighting, EV charging networks, and microgrid systems for sustainable urban development.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Smart Cities Energy Solutions - Integrated Urban Energy Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Cities Energy Solutions - VoltHub",
    description: "Integrated energy infrastructure for modern cities. Street lighting, EV charging networks, and microgrid systems for sustainable urban development.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/sectors/smart-cities`,
  },
};

export default function SmartCitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

