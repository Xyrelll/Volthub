import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  title: "Residential Energy Solutions - VoltHub",
  description: "Power your home with reliable solar energy storage and backup systems. From small backup kits to complete home energy independence. EV charging, solar street lights, and energy storage for Filipino homes.",
  keywords: [
    "residential energy solutions",
    "home energy storage",
    "residential solar",
    "home backup power",
    "residential EV charging",
    "home energy independence",
    "solar for homes",
    "residential battery storage",
    "VoltHub residential",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/sectors/residential`,
    siteName: "VoltHub Energy",
    title: "Residential Energy Solutions - VoltHub",
    description: "Power your home with reliable solar energy storage and backup systems. From small backup kits to complete home energy independence. EV charging, solar street lights, and energy storage for Filipino homes.",
    images: [
      {
        url: "/HomeBanner/homebatt.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Residential Energy Solutions - Home Energy Storage & Solar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Residential Energy Solutions - VoltHub",
    description: "Power your home with reliable solar energy storage and backup systems. From small backup kits to complete home energy independence.",
    images: ["/HomeBanner/homebatt.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/sectors/residential`,
  },
};

export default function ResidentialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

