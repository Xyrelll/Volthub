import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "Industrial Energy Solutions - VoltHub",
  description: "Large-scale power generation systems for factories, industrial parks, and utility-scale projects. From 40kWh to 2.7MWh capacity. Three-phase power for industrial equipment.",
  keywords: [
    "industrial energy solutions",
    "factory power systems",
    "industrial energy storage",
    "utility-scale energy",
    "industrial solar",
    "large-scale power generation",
    "industrial battery storage",
    "factory energy systems",
    "VoltHub industrial",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/sectors/industrial`,
    siteName: "VoltHub Energy",
    title: "Industrial Energy Solutions - VoltHub",
    description: "Large-scale power generation systems for factories, industrial parks, and utility-scale projects. From 40kWh to 2.7MWh capacity. Three-phase power for industrial equipment.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Industrial Energy Solutions - Large-Scale Power Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Industrial Energy Solutions - VoltHub",
    description: "Large-scale power generation systems for factories, industrial parks, and utility-scale projects. From 40kWh to 2.7MWh capacity.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/sectors/industrial`,
  },
};

export default function IndustrialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

