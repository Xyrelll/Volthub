"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LayoutContainer from "@/components/layout/LayoutContainer";
import { RiMapPinLine } from "react-icons/ri";

interface ProjectCase {
  id: string;
  title: string;
  location?: string;
  image: string;
  imageAlt?: string;
  size?: "small" | "medium" | "large";
}

interface ProjectCasesSectionProps {
  title?: string;
  description?: string;
  badge?: string;
  projectCases: ProjectCase[];
}

export default function ProjectCasesSection({
  title = "Customer Project Cases",
  description = "Government / UNDP / World Bank / NGO Projects",
  badge = "Our Work",
  projectCases,
}: ProjectCasesSectionProps) {

  // State to track items per row - starts with SSR-safe default
  const [itemsPerRow, setItemsPerRow] = useState(4);

  // Update items per row after mount to avoid hydration mismatch
  useEffect(() => {
    const updateItemsPerRow = () => {
      if (window.innerWidth >= 1024) setItemsPerRow(5);
      else if (window.innerWidth >= 768) setItemsPerRow(4);
      else if (window.innerWidth >= 640) setItemsPerRow(3);
      else setItemsPerRow(2);
    };

    // Set initial value
    updateItemsPerRow();

    // Update on window resize
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  // Group images into rows for justified layout
  const groupIntoRows = (items: typeof projectCases, itemsPerRow: number) => {
    const rows: typeof projectCases[] = [];
    for (let i = 0; i < items.length; i += itemsPerRow) {
      rows.push(items.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  // Get slide direction based on index for variety
  const getSlideDirection = (index: number) => {
    const directions = [
      "slide-in-left",
      "slide-in-right",
      "slide-in-top",
      "slide-in-bottom",
      "slide-in-left",
      "slide-in-right",
      "slide-in-top",
      "slide-in-bottom",
    ];
    return directions[index % directions.length];
  };

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <LayoutContainer className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 reveal-on-scroll">
          <div className="inline-block mb-3">
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
              <span className="text-xs md:text-sm font-semibold tracking-[0.3em] text-primary uppercase">{badge}</span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text leading-tight mb-2 md:mb-3">
            {title}
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </LayoutContainer>

      {/* Project Cases Justified Grid - Full Width */}
      <div className="w-full relative z-10">
        <div className="flex flex-col space-y-0.5 md:space-y-1 w-full">
          {groupIntoRows(projectCases, itemsPerRow).map((row, rowIndex) => {
            // Same height for all rows - justified grid style
            const rowHeight = 200; // Fixed height for all rows
            const slideDirection = getSlideDirection(rowIndex);
            
            return (
              <div
                key={rowIndex}
                className="flex w-full"
                style={{ height: `${rowHeight}px` }}
              >
                {row.map((project, itemIndex) => {
                  const globalIndex = rowIndex * itemsPerRow + itemIndex;
                  const animationDelay = globalIndex * 0.06;

                  return (
                    <div
                      key={project.id}
                      className={`group relative overflow-hidden h-full cursor-pointer hover-lift flex-1 ${slideDirection}`}
                      style={{
                        animationDelay: `${animationDelay}s`,
                        animationDuration: "0.8s",
                        animationFillMode: "both",
                        marginRight: itemIndex < row.length - 1 ? '2px' : '0',
                      }}
                    >
                        {/* Image Container - Fills height, maintains aspect ratio */}
                        <div className="relative w-full h-full overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.imageAlt || project.title}
                            fill
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                            priority={globalIndex < 4}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          </div>
                          
                          {/* Project Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                            <h3 className="text-white font-bold text-xs md:text-sm mb-1 line-clamp-2 drop-shadow-lg">
                              {project.title}
                            </h3>
                            {project.location && (
                              <div className="flex items-center gap-1 text-white/90 text-[10px] md:text-xs">
                                <RiMapPinLine className="text-primary flex-shrink-0 text-xs" />
                                <span className="line-clamp-1">{project.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Badge - Top right corner */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-primary to-accent text-white text-[10px] md:text-xs font-semibold rounded-md shadow-lg backdrop-blur-sm">
                              View
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
    </section>
  );
}

