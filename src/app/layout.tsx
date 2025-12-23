import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatSupport from "@/components/common/ChatSupport";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VoltHub - Smart Energy Storage & EV Charging Solutions",
    template: "%s | VoltHub",
  },
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
  authors: [{ name: "VoltHub Energy" }],
  creator: "VoltHub Energy",
  publisher: "VoltHub Energy",
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "VoltHub Energy",
    title: "VoltHub - Smart Energy Storage & EV Charging Solutions",
    description: "Cut energy costs by up to 40% with VoltHub's next-generation energy storage and EV charging solutions. Commercial and residential solar, battery storage, and smart grid integration.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Energy - Smart Energy Storage & EV Charging Solutions",
      },
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Energy Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltHub - Smart Energy Storage & EV Charging Solutions",
    description: "Cut energy costs by up to 40% with VoltHub's next-generation energy storage and EV charging solutions.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning={true}>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          orbitron.variable,
          "antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Footer />
          <ChatSupport />
        </ThemeProvider>
      </body>
    </html>
  );
}
