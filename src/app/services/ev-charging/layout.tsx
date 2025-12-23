import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "EV Charging Solutions - VoltHub",
  description: "Complete EV charging infrastructure from AC chargers to ultra-fast DC charging stations. Professional installation, network integration, and 24/7 support for residential, commercial, and industrial applications.",
  keywords: [
    "EV charging",
    "electric vehicle charging",
    "EV charging stations",
    "DC fast charging",
    "AC EV chargers",
    "EV charging installation",
    "commercial EV charging",
    "residential EV charging",
    "VoltHub EV charging",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/services/ev-charging`,
    siteName: "VoltHub Energy",
    title: "EV Charging Solutions - VoltHub",
    description: "Complete EV charging infrastructure from AC chargers to ultra-fast DC charging stations. Professional installation, network integration, and 24/7 support for residential, commercial, and industrial applications.",
    images: [
      {
        url: "/Sector/evcharging.jpeg",
        width: 1200,
        height: 630,
        alt: "VoltHub EV Charging Solutions - Complete Charging Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Charging Solutions - VoltHub",
    description: "Complete EV charging infrastructure from AC chargers to ultra-fast DC charging stations. Professional installation, network integration, and 24/7 support.",
    images: ["/Sector/evcharging.jpeg"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/services/ev-charging`,
  },
};

export default function EVChargingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

