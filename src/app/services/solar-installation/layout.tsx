import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  title: "Solar Installation Services - VoltHub",
  description: "Turn-key solar solutions from consultation to connection. Professional installation of solar street lights, energy storage systems, and off-grid power generation. Custom system sizing and ROI analysis.",
  keywords: [
    "solar installation",
    "solar panel installation",
    "solar street lights",
    "solar energy systems",
    "off-grid solar",
    "solar power installation",
    "solar ROI analysis",
    "solar system sizing",
    "VoltHub solar",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/services/solar-installation`,
    siteName: "VoltHub Energy",
    title: "Solar Installation Services - VoltHub",
    description: "Turn-key solar solutions from consultation to connection. Professional installation of solar street lights, energy storage systems, and off-grid power generation. Custom system sizing and ROI analysis.",
    images: [
      {
        url: "/Sector/solarbg1.jpg",
        width: 1200,
        height: 630,
        alt: "VoltHub Solar Installation Services - Turn-key Solar Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Installation Services - VoltHub",
    description: "Turn-key solar solutions from consultation to connection. Professional installation of solar street lights, energy storage systems, and off-grid power generation.",
    images: ["/Sector/solarbg1.jpg"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/services/solar-installation`,
  },
};

export default function SolarInstallationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

