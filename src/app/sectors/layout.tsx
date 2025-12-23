import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "Energy Solutions by Sector - VoltHub",
  description:
    "Discover tailored energy solutions for every sector. From residential homes to industrial level projects, we provide comprehensive energy infrastructure including energy storage, EV charging, and solar solutions.",
  keywords: [
    "residential energy solutions",
    "commercial energy solutions",
    "industrial energy solutions",
    "energy storage by sector",
    "EV charging by sector",
    "solar solutions by sector",
    "smart cities energy",
    "rural energy projects",
    "VoltHub sectors",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/sectors`,
    siteName: "VoltHub Energy",
    title: "Energy Solutions by Sector - VoltHub",
    description:
      "Discover tailored energy solutions for every sector. From residential homes to industrial level projects, we provide comprehensive energy infrastructure including energy storage, EV charging, and solar solutions.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Energy Solutions by Sector - Residential, Commercial, Industrial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Energy Solutions by Sector - VoltHub",
    description:
      "Discover tailored energy solutions for every sector. From residential homes to industrial level projects, we provide comprehensive energy infrastructure.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/sectors`,
  },
};

export default function SectorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

