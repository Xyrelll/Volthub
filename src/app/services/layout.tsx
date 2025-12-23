import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "Professional Energy Services - VoltHub",
  description: "Expert installation and maintenance of EV charging infrastructure and solar energy systems. From consultation to commissioning, we deliver comprehensive energy solutions tailored to your needs.",
  keywords: [
    "energy services",
    "EV charging installation",
    "solar installation",
    "energy system maintenance",
    "energy consultation",
    "commercial energy services",
    "residential energy services",
    "VoltHub services",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/services`,
    siteName: "VoltHub Energy",
    title: "Professional Energy Services - VoltHub",
    description: "Expert installation and maintenance of EV charging infrastructure and solar energy systems. From consultation to commissioning, we deliver comprehensive energy solutions tailored to your needs.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Professional Energy Services - EV Charging & Solar Installation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Energy Services - VoltHub",
    description: "Expert installation and maintenance of EV charging infrastructure and solar energy systems. From consultation to commissioning, we deliver comprehensive energy solutions.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/services`,
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

