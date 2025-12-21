"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import CarouselBanner from "@/components/home/CarouselBanner";
import HoverEffects from "@/components/home/HoverEffects";
// import ProductShowcase from "./components/ProductShowcase";
import ProductGridShowcase from "./components/ProductGridShowcase";
import RecommendedProducts from "./components/RecommendedProducts";
import BlogResourcesSection from "./components/BlogResourcesSection";
import StatsSection from "./components/StatsSection";
// import HowItWorksSection from "./components/HowItWorksSection";
// import UserSegmentationSection from "./components/UserSegmentationSection";
// import SocialProofSection from "./components/SocialProofSection";
import FAQSection from "./components/FAQSection";
import ProjectCasesSection from "./components/ProjectCasesSection";
// import EnergySavingsCalculator from "./components/EnergySavingsCalculator";
// import VideoSection from "./components/VideoSection";
import {
  carouselSlides,
  stats,
  productShowcases,
  // howItWorksSteps,
  // userSegments,
  // testimonials,
  // videoItems,
  // trustBadges,
  resources,
  faqs,
  projectCases,
} from "./components/homeData";

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex flex-col w-full overflow-x-hidden">
      <HoverEffects />

      {/* Carousel Banner */}
      <CarouselBanner slides={carouselSlides} autoPlay={true} autoPlayInterval={6000} />

      {/* Product Grid Showcase - Combined Section */}
      <ProductGridShowcase
        products={productShowcases.map((showcase) => ({
          badge: showcase.badge,
          badgeColor: showcase.badgeColor,
          title: showcase.title,
          titleParts: showcase.titleParts,
          description: showcase.description,
          image: showcase.image,
          imageAlt: showcase.imageAlt,
          ctaLink: showcase.ctas[0].href,
          ctaText: showcase.ctas[0].text,
          gradientColors: showcase.gradientColors,
        }))}
      />

      <RecommendedProducts />

      {/* How It Works Section */}
      {/* <HowItWorksSection
        title="How It Works"
        description="From consultation to installation, we make the transition to clean energy simple and seamless."
        steps={howItWorksSteps}
      /> */}

      {/* User Segmentation Section */}
      {/* <UserSegmentationSection
        title="Find Your Perfect Solution"
        description="Whether you're a homeowner, business owner, or developer, we have the right energy solution for you."
        segments={userSegments}
      /> */}

      {/* Project Cases Section */}
      <ProjectCasesSection
        title="Customer Project Cases"
        description="Government / UNDP / World Bank / NGO Projects"
        badge="Our Work"
        projectCases={projectCases}
      />

      {/* Social Proof Section */}
      {/* <SocialProofSection
        title="What Our Customers Say"
        description="Join thousands of satisfied customers who have made the switch to clean energy."
        testimonials={testimonials}
        trustBadges={trustBadges}
        showCertifications={false}
      /> */}

      {/* Energy Savings Calculator Section */}
      {/* <EnergySavingsCalculator
        title="Energy Savings Calculator"
        description="Discover how much you could save with VoltHub's energy solutions. Get an instant estimate of your potential savings and ROI."
      /> */}

      {/* Video Section */}
      {/* <VideoSection
        title="See VoltHub in Action"
        description="Discover how VoltHub's energy solutions are transforming homes and businesses worldwide. Watch real customer stories and product demonstrations."
        videoItems={videoItems}
      /> */}

      {/* Blog/Resources Section */}
      {/* <BlogResourcesSection
        title="Latest Resources & Insights"
        description="Stay informed with our latest articles, guides, and industry insights on renewable energy."
        resources={resources}
      /> */}

      {/* FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions"
        description="Find answers to the most common questions about our energy solutions."
        faqs={faqs}
      />

      {/* Lead Capture Section */}
      {/* <LeadCaptureSection
        title="Ready to Make the Switch?"
        description="Join thousands of satisfied customers. Get a free consultation and discover how much you could save with clean energy."
      /> */}

      <BlogResourcesSection
        title="Latest Blogs & Insights"
        description="Stay updated with news, how-to guides, and deep dives on EV charging, solar, and smart energy."
        resources={resources}
        // viewAllLink="/contact"
      />

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}


    </main>
  );
}
