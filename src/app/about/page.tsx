import type { Metadata } from "next";
import LayoutContainer from "@/components/layout/LayoutContainer";
import OverviewSection from "./components/OverviewSection";
import MissionVisionSection from "./components/MissionVisionSection";
import WhoWeAreSection from "./components/WhoWeAreSection";
import WhatWeDoSection from "./components/WhatWeDoSection";
import HistorySection from "./components/HistorySection";
import LeadershipStatsSection from "./components/LeadershipStatsSection";
import MarketInsightsSection from "./components/MarketInsightsSection";
import SectionHeading from "@/components/marketing/SectionHeading";
import BackToTopButton from "@/components/common/BackToTopButton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";

export const metadata: Metadata = {
  title: "About Us - VoltHub",
  description: "Learn about VoltHub's mission to build a cleaner energy economy. Discover our history, values, leadership, and commitment to sustainable energy solutions.",
  keywords: [
    "about VoltHub",
    "clean energy company",
    "energy storage",
    "EV charging",
    "solar energy",
    "renewable energy",
    "VoltHub mission",
    "sustainable energy",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/about`,
    siteName: "VoltHub Energy",
    title: "About Us - VoltHub",
    description: "Learn about VoltHub's mission to build a cleaner energy economy. Discover our history, values, leadership, and commitment to sustainable energy solutions.",
    images: [
      {
        url: "/HomeBanner/banner1.png",
        width: 1200,
        height: 630,
        alt: "About VoltHub - Clean Energy Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - VoltHub",
    description: "Learn about VoltHub's mission to build a cleaner energy economy. Discover our history, values, leadership, and commitment to sustainable energy solutions.",
    images: ["/HomeBanner/banner1.png"],
    creator: "@VoltHubEnergy",
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function About() {
  return (
    <main className="pt-32 bg-linear-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <LayoutContainer className="flex flex-1 flex-col gap-6 pb-16 px-0 md:px-4">
        <SectionHeading
          eyebrow="About VoltHub"
          title="Building the blueprint for a cleaner energy economy"
          align="center"
        />

        <div className="flex flex-col gap-6">
          <OverviewSection />
          <MissionVisionSection />
        </div>
        <WhoWeAreSection />
        <WhatWeDoSection />
        <LeadershipStatsSection />
        {/* <OperationsCarouselSection /> */}
        <MarketInsightsSection />
        <HistorySection />
        {/* <PartnershipsSection /> */}
      </LayoutContainer>
      <BackToTopButton />
    </main>
  );
}
