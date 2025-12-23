import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  title: "Products - Energy Storage & EV Charging Solutions | VoltHub",
  description: "Explore VoltHub's complete range of energy solutions including EV charging stations, solar street lights, smart home IPS, cabinet and container power systems.",
  keywords: [
    "EV charging stations",
    "solar street lights",
    "energy storage systems",
    "smart home IPS",
    "cabinet power systems",
    "container power systems",
    "energy products",
    "renewable energy products",
    "VoltHub products",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/products`,
    siteName: "VoltHub Energy",
    title: "Products - Energy Storage & EV Charging Solutions | VoltHub",
    description: "Explore VoltHub's complete range of energy solutions including EV charging stations, solar street lights, smart home IPS, cabinet and container power systems.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Products - Energy Storage & EV Charging Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Products - Energy Storage & EV Charging Solutions | VoltHub",
    description: "Explore VoltHub's complete range of energy solutions including EV charging stations, solar street lights, smart home IPS, cabinet and container power systems.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/products`,
  },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-slate-50 min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Loading products...</p>
        </main>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
