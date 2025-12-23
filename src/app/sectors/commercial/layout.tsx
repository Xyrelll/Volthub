import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  title: "Commercial Energy Solutions - VoltHub",
  description: "Power your business with reliable solar energy storage and EV charging infrastructure. From small offices to large commercial establishments. Reduce operating costs and ensure reliable power.",
  keywords: [
    "commercial energy solutions",
    "business energy storage",
    "commercial solar",
    "commercial EV charging",
    "office energy solutions",
    "retail energy storage",
    "commercial power systems",
    "business energy savings",
    "VoltHub commercial",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/sectors/commercial`,
    siteName: "VoltHub Energy",
    title: "Commercial Energy Solutions - VoltHub",
    description: "Power your business with reliable solar energy storage and EV charging infrastructure. From small offices to large commercial establishments. Reduce operating costs and ensure reliable power.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Commercial Energy Solutions - Business Energy Storage & EV Charging",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Energy Solutions - VoltHub",
    description: "Power your business with reliable solar energy storage and EV charging infrastructure. From small offices to large commercial establishments.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/sectors/commercial`,
  },
};

export default function CommercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

