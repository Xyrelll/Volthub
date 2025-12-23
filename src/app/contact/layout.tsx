import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";

export const metadata: Metadata = {
  title: "Contact Us - VoltHub",
  description: "Get in touch with VoltHub for energy solutions, quotes, and installations. Contact our team for EV charging, solar installation, and power generation systems.",
  keywords: [
    "contact VoltHub",
    "energy consultation",
    "EV charging quote",
    "solar installation quote",
    "energy storage consultation",
    "VoltHub contact",
    "energy solutions contact",
    "free consultation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/contact`,
    siteName: "VoltHub Energy",
    title: "Contact Us - VoltHub",
    description: "Get in touch with VoltHub for energy solutions, quotes, and installations. Contact our team for EV charging, solar installation, and power generation systems.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "Contact VoltHub - Energy Solutions Consultation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - VoltHub",
    description: "Get in touch with VoltHub for energy solutions, quotes, and installations. Contact our team for EV charging, solar installation, and power generation systems.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

