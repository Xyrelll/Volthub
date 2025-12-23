import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "VoltHub - Smart Energy Storage & EV Charging Solutions",
  description: "Cut energy costs by up to 40% with VoltHub's next-generation energy storage and EV charging solutions. Commercial and residential solar, battery storage, and smart grid integration across the Philippines.",
  keywords: [
    "energy storage",
    "EV charging",
    "solar energy",
    "battery storage",
    "renewable energy",
    "commercial energy solutions",
    "residential solar",
    "smart grid",
    "Philippines energy",
    "VoltHub",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "VoltHub Energy",
    title: "VoltHub - Smart Energy Storage & EV Charging Solutions",
    description: "Cut energy costs by up to 40% with VoltHub's next-generation energy storage and EV charging solutions. Commercial and residential solar, battery storage, and smart grid integration.",
    images: [
      {
        url: `${siteUrl}/logo2.png`,
        width: 1200,
        height: 630,
        alt: "VoltHub Energy - Smart Energy Storage & EV Charging Solutions",
      },
      {
        url: `${siteUrl}/HomeBanner/banner1.png`,
        width: 1200,
        height: 630,
        alt: "VoltHub Energy Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltHub - Smart Energy Storage & EV Charging Solutions",
    description: "Cut energy costs by up to 40% with VoltHub's next-generation energy storage and EV charging solutions.",
    images: [`${siteUrl}/logo2.png`],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

