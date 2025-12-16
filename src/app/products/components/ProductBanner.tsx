"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import LayoutContainer from "@/components/layout/LayoutContainer";
import { RiArrowRightSLine, RiHome2Line } from "react-icons/ri";
import { ProductCategory } from "./productData";

interface Category {
  id: ProductCategory;
  label: string;
}

interface ProductBannerProps {
  activeCategory: ProductCategory;
  categoryBanner: Record<string, { title: string; description: string; image: string; video?: string }>;
  categories: Category[];
}

export default function ProductBanner({ activeCategory, categoryBanner, categories }: ProductBannerProps) {
  const banner = categoryBanner[activeCategory] || categoryBanner["all"] || { 
    title: "Products", 
    description: "", 
    image: "/HomeBanner/banner3.jpg", // Default fallback image
    video: undefined 
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const categoryLabel = categories.find((c) => c.id === activeCategory)?.label || "";

  useEffect(() => {
    if (videoRef.current && banner.video) {
      videoRef.current.playbackRate = 0.5; // Set to 25% speed (super slow motion)
    }
  }, [banner.video, activeCategory]);

  // Don't render image if no image or video
  if (!banner.image && !banner.video) {
    return null;
  }

  return (
    <section className="relative overflow-hidden border-b border-slate-100 min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
      {banner.video ? (
        <video
          ref={videoRef}
          src={banner.video}
          autoPlay
          muted
          playsInline
          {...(activeCategory === "smart-home" && { loop: true })}
          className="w-full h-full md:h-[550px] object-cover"
        />
      ) : banner.image ? (
        <Image
          src={banner.image}
          alt={banner.title}
          width={1600}
          height={400}
          className="w-full h-full md:h-[550px] object-cover"
        />
      ) : null}
      <div className="absolute inset-0">
        <LayoutContainer className="h-full flex flex-col justify-center items-center text-center text-white pt-20 md:pt-30">
          <div className="max-w-4xl w-full border-b border-white/10 pb-6 md:pb-10 mb-6 md:mb-10 space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
              {banner.title}
            </h1>
          </div>
        </LayoutContainer>
        {/* Breadcrumb at bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0">
          <div className="max-w-[1600px] w-full mx-auto px-4">
            <div className="flex items-center justify-start gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base text-white">
              <RiHome2Line className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <RiArrowRightSLine className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="truncate">Products</span>
              {activeCategory !== "all" && (
                <>
                  <RiArrowRightSLine className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="truncate">{categoryLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


