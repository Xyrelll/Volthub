"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  RiCheckLine,
  RiStarLine,
  RiShieldCheckLine,
  RiAwardLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiArrowUpSLine
} from "react-icons/ri";
import { Product, productDetails } from "./productData";

interface ProductDetailEVProps {
  product: Product;
  details: {
    description: string;
    variations: typeof productDetails[string]["variations"];
    specifications: typeof productDetails[string]["specifications"];
    features: typeof productDetails[string]["features"];
  } | undefined;
  categoryLabel: string | undefined;
  displayProductName: string;
  currentPrice: string | undefined;
  selectedVariantIndex: number;
  setSelectedVariantIndex: (index: number) => void;
  pricedVariations: Array<{ name: string; price?: string }>;
  quantity: number;
  setQuantity: (value: number | ((prev: number) => number)) => void;
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  allImages: string[];
  openImageModal: (index: number) => void;
  averageRating: number;
  totalRatings: number;
}

export default function ProductDetailEV({
  product,
  details,
  categoryLabel,
  displayProductName,
  currentPrice,
  selectedVariantIndex,
  setSelectedVariantIndex,
  pricedVariations,
  quantity,
  setQuantity,
  selectedImage,
  setSelectedImage,
  allImages,
  openImageModal,
  averageRating,
  totalRatings,
}: ProductDetailEVProps) {
  const [isBenefitsExpanded, setIsBenefitsExpanded] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      {/* ZONE A: Visual Confirmation (Left Column - 50%) */}
      <div className="lg:w-1/2 space-y-4">
        {/* Main Product Image with Hover Zoom */}
        <button
          onClick={() => openImageModal(allImages.findIndex(img => img === selectedImage))}
          className="relative aspect-square bg-white w-full rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-lg cursor-zoom-in hover:shadow-xl transition-all group"
          aria-label="Click to view larger image"
        >
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 p-4 md:p-6 lg:p-8 group-hover:scale-105"
            priority
          />
          {allImages.length > 1 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-md">
              {allImages.findIndex(img => img === selectedImage) + 1} / {allImages.length}
            </div>
          )}
          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <span className="text-sm text-slate-600 bg-white/90 px-4 py-2 rounded-full font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Click to enlarge
            </span>
          </div>
        </button>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {allImages.map((img, index) => {
              const isSelected = selectedImage === img;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all bg-white shadow-sm ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:scale-105"
                  }`}
                  aria-label={`Select image ${index + 1} of ${allImages.length}`}
                  aria-pressed={isSelected}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - View ${index + 1}`}
                    fill
                    className="object-contain p-1.5"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ZONE B: The "Buy Box" (Right Column - 50%) */}
      <div className="lg:w-1/2">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-200 shadow-sm sticky top-24 space-y-3 md:space-y-4">
          {/* 1. Identity - Product Name (H1) */}
          <div>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary font-semibold">
              {categoryLabel}
            </span>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 mb-1">
              {displayProductName}
            </h1>
            <p className="text-sm md:text-base text-slate-600">{product.subtitle}</p>
          </div>

          {/* 2. Social Proof - Ratings */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <RiStarLine
                  key={star}
                  className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
                    star <= Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs md:text-sm font-semibold text-slate-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] md:text-xs text-slate-500">
              ({totalRatings.toLocaleString()} ratings)
            </span>
          </div>

          {/* 3. Value Proposition - Price & Key Benefits */}
          <div className="pt-1.5 border-t border-slate-200">
            {/* Price - Prominent */}
            {currentPrice && (
              <div className="mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                    {currentPrice}
                  </span>
                  <span className="text-xs md:text-sm text-slate-500">per unit</span>
                </div>
              </div>
            )}

            {/* Key Benefits - Accordion/Collapsible */}
            {details && details.features && details.features.length > 0 && (
              <div className="space-y-1">
                <button
                  onClick={() => setIsBenefitsExpanded(!isBenefitsExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-xs md:text-sm font-semibold text-slate-900">Key Benefits:</h3>
                  {isBenefitsExpanded ? (
                    <RiArrowUpSLine className="h-4 w-4 text-slate-500" />
                  ) : (
                    <RiArrowDownSLine className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                {isBenefitsExpanded && (
                  <ul className="space-y-1.5 mt-2">
                    {details.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5 text-[11px] md:text-xs text-slate-700 leading-relaxed">
                        <RiCheckLine className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {!isBenefitsExpanded && (
                  <div className="mt-1">
                    <p className="text-[11px] md:text-xs text-slate-600 line-clamp-2">
                      {details.features[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Customization - Variations */}
          {pricedVariations.length > 0 && (
            <div className="pt-1.5 border-t border-slate-200">
              <label className="block text-xs md:text-sm font-semibold text-slate-900 mb-2">
                Select Capacity
              </label>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {pricedVariations.map((variant, idx) => {
                  let label = variant.name;
                  const f2Match = variant.name.match(/(F2-\d+)/i);
                  const lvq2Match = variant.name.match(/(LVQ2-\d+)/i);
                  const lvxcMatch = variant.name.match(/(LVXC-\d+)/i);
                  const kWhMatch = variant.name.match(/(\d+\s*kWh)/i);
                  const kwMatch = variant.name.match(/(\d+\s*kW?)/i);
                  
                  if (f2Match) {
                    label = f2Match[1].toUpperCase();
                  } else if (lvq2Match) {
                    label = lvq2Match[1].toUpperCase();
                  } else if (lvxcMatch) {
                    label = lvxcMatch[1].toUpperCase();
                  } else if (kWhMatch) {
                    label = kWhMatch[1];
                  } else if (kwMatch) {
                    label = kwMatch[1];
                  } else {
                    label = variant.name.split("–")[0]?.trim() || variant.name;
                  }
                  
                  const isActive = idx === selectedVariantIndex;
                  const isAvailable = true;
                  
                    return (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        disabled={!isAvailable}
                        className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-semibold border-2 shadow-sm transition-all ${
                          !isAvailable
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                            : isActive
                            ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                            : "bg-white text-slate-700 border-slate-300 hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {label}
                      </button>
                    );
                })}
              </div>
            </div>
          )}

          {/* System Type Tag */}
          {product.tag && (
            <div className="pt-1.5 border-t border-slate-200">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-1 text-[10px] md:text-xs font-semibold">
                {product.tag}
              </span>
            </div>
          )}

          {/* 5. Volume - Quantity */}
          <div className="pt-1.5 border-t border-slate-200">
            <label className="block text-xs md:text-sm font-semibold text-slate-900 mb-1.5">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-slate-300 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary transition-all font-bold text-base md:text-lg"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, value));
                }}
                className="w-16 md:w-20 h-8 md:h-10 text-center text-sm md:text-base font-semibold border-2 border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-slate-300 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary transition-all font-bold text-base md:text-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* 6. Action - CTAs */}
          <div className="pt-1.5 border-t border-slate-200">
            {/* Primary CTA - Get Quote (Most Dominant) */}
            <Link
              href={`/contact?subject=quote&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}&quantity=${quantity}&price=${encodeURIComponent(currentPrice || '')}`}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 md:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base group"
            >
              <span>Get Quote</span>
              <RiArrowRightSLine className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 7. Reassurance - Logistics & Trust */}
          <div className="pt-1.5 border-t border-slate-200 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-600">
                <RiShieldCheckLine className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                <span>5-Year Warranty</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-600">
                <RiAwardLine className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                <span>Certified Quality</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-600">
                <RiCheckLine className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
                <span>500+ Installations</span>
              </div>
            </div>
            <div className="text-[10px] md:text-xs text-slate-500 space-y-0.5">
              <p>✓ Free consultation and site assessment</p>
              <p>✓ Professional installation included</p>
              <p>✓ 24/7 customer support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

