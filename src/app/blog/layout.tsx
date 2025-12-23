import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
  description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology. Expert articles from VoltHub Energy.",
  keywords: [
    "energy storage blog",
    "EV charging news",
    "solar energy insights",
    "commercial energy solutions",
    "smart grid technology",
    "renewable energy articles",
    "energy efficiency guides",
    "VoltHub blog",
  ],
  openGraph: {
    title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
    description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology.",
    type: "website",
    url: "/blog",
    siteName: "VoltHub Energy",
    images: [
      {
        url: "/Blog/blogtitle.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Blog - Energy Storage & EV Charging Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
    description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology.",
    images: ["/Blog/blogtitle.png"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

