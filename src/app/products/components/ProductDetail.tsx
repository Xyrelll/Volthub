"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  RiArrowLeftLine, 
  RiCheckLine,
  RiSettings3Line,
  RiMapPinLine,
  RiFileList3Line,
  RiHeartLine,
  RiHeartFill,
  RiChat3Line,
  RiThumbUpLine,
  RiStarLine,
  RiAwardLine,
  RiDownloadLine,
  RiCalendarLine,
  RiQuestionLine,
  RiTimeLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from "react-icons/ri";
import { Product, categories } from "./productData";
import ProductDetailEV from "./ProductDetailEV";
import ProductDetailB2B from "./ProductDetailB2B";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  // Use product data directly from database (variations, specifications, features are already included)
  // Fallback to empty arrays if not provided
  const details = {
    variations: product.variations || [],
    specifications: product.specifications || [],
    features: product.features || [],
    description: product.description || "",
  };
  
  const categoryLabel = categories.find((c) => c.id === product.category)?.label || product.category;
  
  // Determine layout: use product.layout if specified, otherwise use category-based default
  const productLayout = product.layout || "auto";
  const isEVProduct = productLayout === "ev" || (productLayout === "auto" && product.category === "ev-charging");
  const isSmartHomeProduct = product.category === "smart-home";
  const isCabinetProduct = product.category === "cabinet";
  // Container category merged into cabinet; detect by ID for container-specific UI
  const isContainerProduct = product.id === "container-con1";
  
  // Related products will be fetched separately if needed
  // For now, we'll keep it empty or fetch from API later
  const relatedProducts: Product[] = [];
  
  // Variant-based pricing (for products that define prices on variations)
  const pricedVariations =
    details?.variations?.filter(
      (v) => typeof v.price === "string" && 
      (!v.name.toLowerCase().includes("model") || 
       v.name.toLowerCase().includes("f2-") ||
       v.name.toLowerCase().includes("lvq2-") ||
       v.name.toLowerCase().includes("lvxc-"))
    ) ?? [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant =
    pricedVariations.length > 0 ? pricedVariations[selectedVariantIndex] : undefined;

  // Get display name with variation
  const displayProductName = useMemo(() => {
    if (!selectedVariant) return product.name;
    
    // Extract label: F2-050, F2-080, LVQ2-080, LVXC-120, etc. or 40kWh, 60kWh, etc.
    let label = selectedVariant.name;
    const f2Match = selectedVariant.name.match(/(F2-\d+)/i);
    const lvq2Match = selectedVariant.name.match(/(LVQ2-\d+)/i);
    const lvxcMatch = selectedVariant.name.match(/(LVXC-\d+)/i);
    const kWhMatch = selectedVariant.name.match(/(\d+\s*kWh)/i);
    const kwMatch = selectedVariant.name.match(/(\d+\s*kW?)/i);
    
    if (f2Match) {
      label = f2Match[1].toUpperCase();
      // Replace "F2 Series" with the variation name
      return product.name.replace(/F2\s+Series/i, label);
    } else if (lvq2Match) {
      label = lvq2Match[1].toUpperCase();
      // Replace "LVQ2 Series" or "LV02" with the variation name
      return product.name.replace(/LVQ2\s+Series/i, label).replace(/LV02/i, label);
    } else if (lvxcMatch) {
      label = lvxcMatch[1].toUpperCase();
      // Replace "LVXC Series", "LV02", "LVXC2", or "LVXC3" with the variation name
      return product.name.replace(/LVXC\s+Series/i, label).replace(/LV02/i, label).replace(/LVXC2/i, label).replace(/LVXC3/i, label);
    } else if (kWhMatch) {
      label = kWhMatch[1];
      // Replace any existing kWh values in the product name with the selected variation
      // If no kWh values exist, append the variation
      const hasKWh = /\d+\s*kWh/gi.test(product.name);
      return hasKWh 
        ? product.name.replace(/\d+\s*kWh/gi, label)
        : `${product.name} ${label}`;
    } else if (kwMatch) {
      label = kwMatch[1];
      return `${product.name} ${label}`;
    } else {
      label = selectedVariant.name.split("–")[0]?.trim() || selectedVariant.name;
      return `${product.name} ${label}`;
    }
  }, [product.name, selectedVariant]);

  // Get current specifications (use variant-specific if available, otherwise use default)
  const currentSpecifications = useMemo(() => {
    if (selectedVariant?.specifications && selectedVariant.specifications.length > 0) {
      return selectedVariant.specifications;
    }
    return details?.specifications ?? [];
  }, [selectedVariant, details?.specifications]);

  // Get all images (main image + additional images + variant image if selected)
  const allImages = useMemo(() => {
    const baseImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image];

    // For cabinet-item4: show the selected variant image + disc images only
    if (product.id === "cabinet-item4" && selectedVariant?.image) {
      const discImages = baseImages.filter((img) => img.includes("disc"));
      return [selectedVariant.image, ...discImages];
    }
    
    // For cabinet-14: filter out variant-specific images and show only the selected variant's image
    if (product.id === "cabinet-14" && selectedVariant?.image) {
      const filteredImages = baseImages.filter((img) => 
        !img.includes("/cb14/215.png") &&
        !img.includes("/cb14/233.png") &&
        !img.includes("/cb14/261.png")
      );
      return [selectedVariant.image, ...filteredImages];
    }
    
    // For cabinet-15: filter out variant-specific images and show only the selected variant's image
    if (product.id === "cabinet-15" && selectedVariant?.image) {
      const filteredImages = baseImages.filter((img) => 
        !img.includes("/cb15/466.png") &&
        !img.includes("/cb15/522.png")
      );
      return [selectedVariant.image, ...filteredImages];
    }
    
    return baseImages;
  }, [product.images, product.image, product.id, selectedVariant?.image]);
  const [selectedImage, setSelectedImage] = useState(() => allImages[0] || product.image);
  const [activeTab, setActiveTab] = useState<"overview" | "specifications" | "reviews" | "projects" | "documentation">("overview");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const currentPrice =
    pricedVariations.length > 0
      ? pricedVariations[selectedVariantIndex]?.price ?? product.price
      : product.price;
  const descriptionText =
    selectedVariant?.description ?? details?.description;
  
  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant?.image) {
      setSelectedImage(selectedVariant.image);
    } else {
      // Reset to first image if variant doesn't have a specific image
      setSelectedImage(allImages[0]);
    }
  }, [selectedVariant, allImages]);
  
  
  // Interactive stats state
  const [likes, setLikes] = useState(1234);
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalRatings, setTotalRatings] = useState(856);
  const [positiveReviews, setPositiveReviews] = useState(856);

  // Handle image modal
  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const navigateModalImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setModalImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    } else {
      setModalImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageModalOpen]);


  return (
    <div className="space-y-4 md:space-y-8 w-full md:w-3/4 md:mx-auto pb-24 lg:pb-8">
      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors "
      >
        <RiArrowLeftLine className="h-4 w-4" />
        <span>Back to Products</span>
      </Link>

      {/* Conditional Layout: Consumer (EV) vs B2B (Other Products) */}
      {isEVProduct ? (
        <ProductDetailEV
          product={product}
          details={details}
          categoryLabel={categoryLabel}
          displayProductName={displayProductName}
          currentPrice={currentPrice}
          selectedVariantIndex={selectedVariantIndex}
          setSelectedVariantIndex={setSelectedVariantIndex}
          pricedVariations={pricedVariations}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          allImages={allImages}
          openImageModal={openImageModal}
          averageRating={averageRating}
          totalRatings={totalRatings}
        />
      ) : (
        <ProductDetailB2B
          product={product}
          details={details}
          categoryLabel={categoryLabel}
          displayProductName={displayProductName}
          currentPrice={currentPrice}
          selectedVariantIndex={selectedVariantIndex}
          setSelectedVariantIndex={setSelectedVariantIndex}
          pricedVariations={pricedVariations}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          allImages={allImages}
          openImageModal={openImageModal}
          isCabinetProduct={isCabinetProduct}
          isContainerProduct={isContainerProduct}
        />
      )}

      {/* Mobile Sticky Buy Button Bar - Only visible on mobile (for both layouts) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-2xl z-50 p-4 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex-1">
            {currentPrice && !isCabinetProduct && !isContainerProduct ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{currentPrice}</span>
                <span className="text-xs text-slate-500">per unit</span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-900">Request Pricing</div>
            )}
          </div>
          <Link
            href={`/contact?subject=${isEVProduct ? 'quote' : 'rfq'}&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}&quantity=${quantity}&price=${encodeURIComponent(currentPrice || '')}`}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-base"
          >
            <span>{isEVProduct ? 'Get Quote' : 'Request RFQ'}</span>
            <RiArrowRightSLine className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* ZONE C: Below the Fold - Deep Dive Section */}
      {/* Description Section - Full Width */}
      {details && descriptionText && (
        <div className="mt-6 md:mt-8 bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
            Description
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-line">
            {descriptionText}
          </p>
        </div>
      )}

      {/* Bottom Section - Full Width with Tabs */}
      <div className="mt-6 md:mt-12">
        <div className="border-b border-slate-200 mb-4 md:mb-6">
          <nav className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <RiFileList3Line className="h-3 w-3 md:h-4 md:w-4" />
                Overview
              </span>
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "specifications"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <RiSettings3Line className="h-3 w-3 md:h-4 md:w-4" />
                Specifications
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <RiChat3Line className="h-3 w-3 md:h-4 md:w-4" />
                {isEVProduct ? "Reviews" : "Case Studies"}
              </span>
            </button>
            {!isEVProduct && (
              <button
                onClick={() => setActiveTab("documentation")}
                className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "documentation"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-1 md:gap-2">
                  <RiDownloadLine className="h-3 w-3 md:h-4 md:w-4" />
                  Documentation
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "projects"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <RiMapPinLine className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{isEVProduct || isCabinetProduct || isSmartHomeProduct ? "Applicable Spaces" : "Sample Projects"}</span>
                <span className="sm:hidden">{isEVProduct || isCabinetProduct || isSmartHomeProduct ? "Spaces" : "Projects"}</span>
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 lg:p-8">
          {activeTab === "overview" && (
            <div className=" ">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">Product Overview</h3>
              
              {/* Product Images Gallery */}
              {product.images && product.images.length > 0 && (
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 border-b border-slate-200 pb-2">Product Images</h4>
                  <div className="flex flex-col">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-full"
                      >
                        <Image
                          src={img}
                          alt={`${product.name} - Image ${index + 1}`}
                          width={1200}
                          height={800}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {details && details.features && details.features.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h4 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {details.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <RiCheckLine className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {isEVProduct ? "Technical Specifications" : "Complete Technical Specifications"}
                </h3>
                {!isEVProduct && (
                  <button
                    onClick={() => {
                      const specSheetUrl = `/specs/${product.id}.pdf`;
                      window.open(specSheetUrl, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                  >
                    <RiDownloadLine className="h-4 w-4" />
                    <span>Download Full Spec Sheet</span>
                  </button>
                )}
              </div>
              {currentSpecifications && currentSpecifications.length > 0 && (
                <div className="overflow-x-auto">
                  {/* B2B: Dense table format, Consumer: Card format */}
                  {!isEVProduct ? (
                    /* Dense Table for B2B */
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-300">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Specification</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentSpecifications.map((spec, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-sm text-slate-900">{spec.label}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    /* Card Format for Consumer */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 rounded-xl bg-white overflow-hidden">
                      {currentSpecifications.map((spec, index) => {
                        const isLastItem = index === currentSpecifications.length - 1;
                        const isNotFirstColumn = index % 3 !== 0;
                        return (
                          <div 
                            key={index} 
                            className={`p-3 md:p-4 ${
                              !isLastItem ? 'border-b md:border-b-0 border-slate-200' : ''
                            } ${
                              isNotFirstColumn ? 'md:border-l border-slate-200' : ''
                            }`}
                          >
                            <div className="text-xs text-slate-500 font-medium mb-1">{spec.label}</div>
                            <div className="text-sm text-slate-900">{spec.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">
                {isEVProduct ? "Reviews & Community" : "Case Studies & Project References"}
              </h3>
              
              {!isEVProduct ? (
                /* B2B: Case Studies */
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RiAwardLine className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Highway Infrastructure Project</h4>
                        <p className="text-sm text-slate-600">Municipality of [City Name] - 500 Units Supplied</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                      Successfully supplied and installed 500 units of {displayProductName} for a major highway lighting project. 
                      The project was completed on schedule with zero defects. All units passed quality inspection and have been 
                      operational for 2+ years with 99.8% uptime.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">500 Units</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">On-Time Delivery</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">2+ Years Operational</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RiAwardLine className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Commercial Complex Installation</h4>
                        <p className="text-sm text-slate-600">[Company Name] - 200 Units Supplied</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                      Delivered 200 units for a large commercial complex. Custom configuration was provided to meet specific 
                      requirements. Installation was completed by our certified technicians with full documentation and training provided.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">200 Units</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Custom Configuration</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Certified Installation</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6">
                    <h4 className="text-base font-semibold text-slate-900 mb-2">Request Project References</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      For detailed case studies, project references, and testimonials from government contractors and commercial clients, 
                      please contact our sales team.
                    </p>
                    <Link
                      href={`/contact?subject=references&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                    >
                      <RiChat3Line className="h-4 w-4" />
                      <span>Contact for References</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Consumer: Reviews */
                <>
              
              {/* Stats Section - Enhanced */}
              <div className="grid grid-cols-3 gap-2 md:gap-5 mb-6 md:mb-8">
                {/* Likes - Compact on mobile, Enhanced on desktop */}
                <button
                  onClick={() => {
                    setIsLiked(!isLiked);
                    setLikes(prev => isLiked ? prev - 1 : prev + 1);
                  }}
                  className="group flex flex-col items-center gap-1.5 md:block md:relative md:overflow-hidden md:bg-gradient-to-br md:from-white md:to-slate-50 rounded-lg md:rounded-xl md:border-2 md:border-slate-200 hover:border-red-300 md:hover:shadow-lg transition-all duration-300 py-2 md:p-5 md:p-6 text-center md:text-left"
                >
                  <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-300 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500'
                  }`}>
                    {isLiked ? (
                      <RiHeartFill className="h-4 w-4 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                    ) : (
                      <RiHeartLine className="h-4 w-4 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                    )}
                  </div>
                  <div className="md:relative md:z-10">
                    <div className="text-sm md:text-2xl lg:text-3xl font-bold text-slate-900 mb-0 md:mb-1 transition-all md:group-hover:scale-105">
                      {likes.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 font-medium">Likes</div>
                  </div>
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/0 group-hover:from-red-50/50 group-hover:to-transparent transition-all duration-300" />
                </button>

                {/* Rating - Compact on mobile, Enhanced on desktop */}
                <div 
                  className="flex flex-col items-center gap-1.5 md:block md:relative md:overflow-hidden md:bg-gradient-to-br md:from-white md:to-slate-50 rounded-lg md:rounded-xl md:border-2 md:border-slate-200 hover:border-yellow-300 md:hover:shadow-lg transition-all duration-300 py-2 md:p-5 md:p-6 text-center"
                  onMouseLeave={() => setHoveredStar(0)}
                >
                  <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-yellow-50">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (hoveredStar || (hasRated ? userRating : Math.round(averageRating)));
                        return (
                          <button
                            key={star}
                            onClick={() => {
                              if (!hasRated) {
                                setUserRating(star);
                                setHasRated(true);
                                const newTotal = totalRatings + 1;
                                const newAvg = ((averageRating * totalRatings) + star) / newTotal;
                                setAverageRating(newAvg);
                                setTotalRatings(newTotal);
                                setPositiveReviews(prev => prev + 1);
                              }
                            }}
                            onMouseEnter={() => setHoveredStar(star)}
                            className="transition-transform hover:scale-125 active:scale-95"
                          >
                            <RiStarLine
                              className={`h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-all ${
                                isActive
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300 hover:text-yellow-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:relative md:z-10">
                    <div className="text-sm md:text-2xl lg:text-3xl font-bold text-slate-900 mb-0 md:mb-1">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 font-medium">{totalRatings.toLocaleString()} ratings</div>
                  </div>
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-yellow-50/0 to-yellow-50/0 hover:from-yellow-50/50 hover:to-transparent transition-all duration-300" />
                </div>

                {/* Positive Reviews - Compact on mobile, Enhanced on desktop */}
                <button
                  onClick={() => {
                    setPositiveReviews(prev => prev + 1);
                  }}
                  className="group flex flex-col items-center gap-1.5 md:block md:relative md:overflow-hidden md:bg-gradient-to-br md:from-white md:to-slate-50 rounded-lg md:rounded-xl md:border-2 md:border-slate-200 hover:border-blue-300 md:hover:shadow-lg transition-all duration-300 py-2 md:p-5 md:p-6 text-center md:text-left"
                >
                  <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-all duration-300">
                    <RiThumbUpLine className="h-4 w-4 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  </div>
                  <div className="md:relative md:z-10">
                    <div className="text-sm md:text-2xl lg:text-3xl font-bold text-slate-900 mb-0 md:mb-1 transition-all md:group-hover:scale-105">
                      {positiveReviews.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 font-medium">Positive Reviews</div>
                  </div>
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-transparent transition-all duration-300" />
                </button>
              </div>

              {/* Customer Comments - Enhanced */}
              <div className="mt-8 md:mt-10">
                <h4 className="text-lg md:text-xl font-semibold text-slate-900 mb-5 md:mb-6 flex items-center gap-2">
                  <RiStarLine className="h-5 w-5 text-yellow-500 fill-current" />
                  Customer Comments & Reviews
                </h4>
                <div className="space-y-4 md:space-y-5">
                  <div className="group p-4 md:p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/10">
                        <span className="text-sm md:text-base text-primary font-bold">JD</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm md:text-base font-bold text-slate-900">John Doe</div>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Verified</span>
                        </div>
                        <div className="text-xs md:text-sm text-slate-500">Verified Customer</div>
                      </div>
                      <div className="flex items-center gap-0.5 md:gap-1 text-yellow-500 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <RiStarLine key={star} className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-3 md:mb-4 pl-0 md:pl-14">
                      &quot;Excellent charging station! Fast charging speed and very reliable. 
                      Perfect for our commercial parking lot. Highly recommend!&quot;
                    </p>
                    <div className="flex items-center justify-between pl-0 md:pl-14">
                      <div className="text-xs md:text-sm text-slate-500 flex items-center gap-1">
                        <RiTimeLine className="h-3 w-3" />
                        2 days ago
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                          <RiThumbUpLine className="h-3 w-3" />
                          Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-4 md:p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100">
                        <span className="text-sm md:text-base text-blue-700 font-bold">SM</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm md:text-base font-bold text-slate-900">Sarah Miller</div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Business</span>
                        </div>
                        <div className="text-xs md:text-sm text-slate-500">Business Owner</div>
                      </div>
                      <div className="flex items-center gap-0.5 md:gap-1 text-yellow-500 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <RiStarLine key={star} className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-3 md:mb-4 pl-0 md:pl-14">
                      &quot;Installed 5 units at our expressway service area. Great performance 
                      and customer satisfaction. The dual-gun feature is a game-changer!&quot;
                    </p>
                    <div className="flex items-center justify-between pl-0 md:pl-14">
                      <div className="text-xs md:text-sm text-slate-500 flex items-center gap-1">
                        <RiTimeLine className="h-3 w-3" />
                        1 week ago
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                          <RiThumbUpLine className="h-3 w-3" />
                          Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-4 md:p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0 ring-2 ring-green-100">
                        <span className="text-sm md:text-base text-green-700 font-bold">MC</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm md:text-base font-bold text-slate-900">Mike Chen</div>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Fleet</span>
                        </div>
                        <div className="text-xs md:text-sm text-slate-500">Fleet Manager</div>
                      </div>
                      <div className="flex items-center gap-0.5 md:gap-1 text-yellow-500 flex-shrink-0">
                        {[1, 2, 3, 4].map((star) => (
                          <RiStarLine key={star} className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                        ))}
                        <RiStarLine className="h-4 w-4 md:h-5 md:w-5 text-slate-300" />
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-3 md:mb-4 pl-0 md:pl-14">
                      &quot;Future-proof design with excellent build quality. Our EV fleet 
                      charges efficiently. Weather resistance is impressive.&quot;
                    </p>
                    <div className="flex items-center justify-between pl-0 md:pl-14">
                      <div className="text-xs md:text-sm text-slate-500 flex items-center gap-1">
                        <RiTimeLine className="h-3 w-3" />
                        2 weeks ago
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                          <RiThumbUpLine className="h-3 w-3" />
                          Helpful
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {activeTab === "documentation" && !isEVProduct && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">
                Technical Documentation & Resources
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Download technical documentation, CAD files, and installation guides for your project planning.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spec Sheet PDF */}
                <button
                  onClick={() => {
                    const specSheetUrl = `/specs/${product.id}.pdf`;
                    window.open(specSheetUrl, '_blank');
                  }}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <RiFileList3Line className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Product Specification Sheet</h4>
                    <p className="text-xs text-slate-600">Complete technical specifications in PDF format</p>
                  </div>
                  <RiDownloadLine className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </button>

                {/* Installation Guide */}
                <button
                  onClick={() => {
                    const installGuideUrl = `/docs/${product.id}-installation.pdf`;
                    window.open(installGuideUrl, '_blank');
                  }}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <RiFileList3Line className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">Installation Guide</h4>
                    <p className="text-xs text-slate-600">Step-by-step installation instructions</p>
                  </div>
                  <RiDownloadLine className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </button>

                {/* CAD Files */}
                <button
                  onClick={() => {
                    const cadUrl = `/cad/${product.id}.dwg`;
                    window.open(cadUrl, '_blank');
                  }}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <RiFileList3Line className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">CAD Drawing (DWG)</h4>
                    <p className="text-xs text-slate-600">AutoCAD compatible drawing files</p>
                  </div>
                  <RiDownloadLine className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </button>

                {/* BIM Objects */}
                <button
                  onClick={() => {
                    const bimUrl = `/bim/${product.id}.rfa`;
                    window.open(bimUrl, '_blank');
                  }}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <RiFileList3Line className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">BIM Object (RFA)</h4>
                    <p className="text-xs text-slate-600">Revit-compatible BIM files</p>
                  </div>
                  <RiDownloadLine className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 mt-6">
                <h4 className="text-base font-semibold text-slate-900 mb-2">Need Additional Documentation?</h4>
                <p className="text-sm text-slate-600 mb-4">
                  For custom configurations, detailed engineering drawings, or project-specific documentation, 
                  please contact our technical support team.
                </p>
                <Link
                  href={`/contact?subject=documentation&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  <RiChat3Line className="h-4 w-4" />
                  <span>Request Custom Documentation</span>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
                {isContainerProduct
                  ? "Applicable Scenarios"
                  : isEVProduct || isCabinetProduct || isSmartHomeProduct
                  ? "Applicable Spaces"
                  : "Sample Projects"}
              </h3>
              {isContainerProduct ? (
                <div className="space-y-4 md:space-y-6">
                  <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6">
                    {product.id === "container-con1"
                      ? "Small utility-level / industrial park containerized BESS system. Ideal for main power for small island towns (currently using diesel generators), industrial park or export zone tenants (cold-storage hubs, fish ports, mining camps), and large university or hospital campuses or combined municipal loads. When paired with big solar and possibly backup diesel, can provide 24/7 coverage."
                      : "Suitable for utility-scale applications, large industrial complexes, and major infrastructure projects requiring reliable, high-capacity energy storage."
                    }
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {(product.id === "container-con1"
                      ? [
                          { title: "Small Island Towns", description: "Main power for small island towns currently using diesel generators", image: "/Product/containertype/location/loc1.png" },
                          { title: "Industrial Parks", description: "Industrial park or export zone tenants requiring reliable power", image: "/Product/containertype/location/loc2.png" },
                          { title: "Cold-Storage Hubs", description: "Cold-storage hubs in industrial parks and export zones", image: "/Product/containertype/location/loc3.png" },
                          { title: "Fish Ports", description: "Fish ports and landing centers requiring continuous power", image: "/Product/containertype/location/loc4.png" },
                          { title: "Mining Camps", description: "Mining camps and remote industrial operations", image: "/Product/containertype/location/loc5.png" },
                          { title: "University Campuses", description: "Large university campuses with significant energy demands", image: "/Product/containertype/location/loc6.png" },
                          { title: "Hospital Campuses", description: "Large hospital campuses requiring 24/7 reliable power", image: "/Product/containertype/location/loc7.png" },
                          { title: "Municipal Loads", description: "Combined municipal loads and public facilities", image: "/Product/containertype/location/loc8.png" },
                          { title: "Export Zones", description: "Export processing zones and special economic zones", image: "/Product/containertype/location/loc9.png" },
                          { title: "Utility Operations", description: "Small utility-level operations replacing diesel generators", image: "/Product/containertype/location/loc10.png" },
                        ]
                      : [
                          { title: "Large Industrial Complexes", description: "Large industrial complexes requiring massive power" },
                          { title: "Utility-Scale Projects", description: "Utility-scale energy storage applications" },
                          { title: "Major Infrastructure", description: "Major infrastructure projects" },
                          { title: "Manufacturing Facilities", description: "Large manufacturing facilities" },
                        ]
                    ).map((scenario, index) => (
                      <div
                        key={index}
                        className="w-full md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] group bg-white rounded-xl p-4 md:p-5 border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        {('image' in scenario && scenario.image && product.id === "container-con1") ? (
                          <>
                            <div className="relative w-full h-32 md:h-40 mb-3 rounded-lg overflow-hidden bg-slate-100">
                              <Image
                                src={scenario.image}
                                alt={scenario.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="font-semibold text-sm md:text-base text-slate-900 mb-2">{scenario.title}</h4>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <RiMapPinLine className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                            <h4 className="font-semibold text-sm md:text-base text-slate-900">{scenario.title}</h4>
                          </div>
                        )}
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isCabinetProduct ? (
                <div className="space-y-4 md:space-y-6">
                  <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6">
                    {product.id === "cabinet-14"
                      ? "Suitable for whole small islands / sitios (dozens of households), LGU projects (solarizing barangays, ports, fish landing centers), and large commercial farms, cold-storage hubs, ice plants."
                      : product.id === "cabinet-15"
                      ? "Suitable for whole small islands / sitios (dozens of households), LGU projects (solarizing barangays, ports, fish landing centers), and large commercial farms, cold-storage hubs, ice plants."
                      : product.id === "cabinet-16"
                      ? "Can act as the main power plant for whole small island barangays with a few hundred households, large resort complexes, or clusters of factories."
                      : product.id === "cabinet-item4"
                      ? "Suitable for single businesses, small compounds, schools, resorts, barangay centers, off-grid tourist sites, poultry/piggery/fish farms, and telecom sites."
                      : "Suitable for large-scale commercial and industrial applications, utility-scale projects, and major infrastructure."
                    }
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {(product.id === "cabinet-14"
                      ? [
                          { title: "Whole Small Islands", description: "Whole small islands / sitios (dozens of households)", image: "/Product/cabinet/location/cab14/loc1.png" },
                          { title: "LGU Projects", description: "LGU projects: solarizing barangays, ports, fish landing centers", image: "/Product/cabinet/location/cab14/loc2.png" },
                          { title: "Barangays", description: "Solarizing barangays with community power", image: "/Product/cabinet/location/cab14/loc3.png" },
                          { title: "Ports", description: "Port facilities requiring reliable power", image: "/Product/cabinet/location/cab14/loc4.png" },
                          { title: "Fish Landing Centers", description: "Fish landing centers needing power for operations", image: "/Product/cabinet/location/cab14/loc5.png" },
                          { title: "Large Commercial Farms", description: "Large commercial farms with extensive power needs", image: "/Product/cabinet/location/cab14/loc6.png" },
                          { title: "Cold-Storage Hubs", description: "Cold-storage hubs requiring continuous power", image: "/Product/cabinet/location/cab14/loc7.png" },
                          { title: "Ice Plants", description: "Ice plants needing reliable industrial power", image: "/Product/cabinet/location/cab14/loc8.png" },
                        ]
                      : product.id === "cabinet-15"
                      ? [
                          { title: "Whole Small Islands", description: "Whole small islands / sitios (dozens of households)", image: "/Product/cabinet/location/cab14/loc1.png" },
                          { title: "LGU Projects", description: "LGU projects: solarizing barangays, ports, fish landing centers", image: "/Product/cabinet/location/cab14/loc2.png" },
                          { title: "Barangays", description: "Solarizing barangays with community power", image: "/Product/cabinet/location/cab14/loc3.png" },
                          { title: "Ports", description: "Port facilities requiring reliable power", image: "/Product/cabinet/location/cab14/loc4.png" },
                          { title: "Fish Landing Centers", description: "Fish landing centers needing power for operations", image: "/Product/cabinet/location/cab14/loc5.png" },
                          { title: "Large Commercial Farms", description: "Large commercial farms with extensive power needs", image: "/Product/cabinet/location/cab14/loc6.png" },
                          { title: "Cold-Storage Hubs", description: "Cold-storage hubs requiring continuous power", image: "/Product/cabinet/location/cab14/loc7.png" },
                          { title: "Ice Plants", description: "Ice plants needing reliable industrial power", image: "/Product/cabinet/location/cab14/loc8.png" },
                        ]
                      : product.id === "cabinet-16"
                      ? [
                          { title: "Small Island Barangays", description: "Whole small island barangay with a few hundred households, a school, a clinic, and small businesses", image: "/Product/cabinet/location/cab14/loc1.png" },
                          { title: "Large Resort Complexes", description: "Large resort complex with multiple buildings, pools, restaurants, and laundry", image: "/Product/cabinet/location/cab14/loc2.png" },
                          { title: "Factory Clusters", description: "Cluster of factories (e.g., agro-processing complex)", image: "/Product/cabinet/location/cab14/loc3.png" },
                          { title: "Island Grids", description: "Main power plant for island communities", image: "/Product/cabinet/location/cab14/loc4.png" },
                          { title: "Village Power Plants", description: "Primary power source for entire villages", image: "/Product/cabinet/location/cab14/loc5.png" },
                          { title: "Resort Power Systems", description: "Complete power solution for large resort operations", image: "/Product/cabinet/location/cab14/loc6.png" },
                        ]
                      : product.id === "cabinet-item4"
                      ? [
                          { title: "Single Businesses", description: "Single business or small compound applications", image: "/Product/cabinet/location/loc1.png" },
                          { title: "Schools", description: "Schools requiring reliable power supply", image: "/Product/cabinet/location/loc2.png" },
                          { title: "Resorts", description: "Resorts needing off-grid power solutions", image: "/Product/cabinet/location/loc3.png" },
                          { title: "Barangay Centers", description: "Barangay centers and community facilities", image: "/Product/cabinet/location/loc4.png" },
                          { title: "Off-Grid Tourist Sites", description: "Off-grid tourist sites with a few cottages", image: "/Product/cabinet/location/loc5.png" },
                          { title: "Poultry/Piggery/Fish Farms", description: "Poultry/piggery/fish farms (lighting, blowers, small machinery)", image: "/Product/cabinet/location/loc6.png" },
                          { title: "Telecom Sites", description: "Telecom sites that want to reduce diesel use", image: "/Product/cabinet/location/loc7.png" },
                          { title: "Small Industrial Plants", description: "Small industrial operations requiring reliable power", image: "/Product/cabinet/location/loc8.png" },
                        ]
                      : [
                          { title: "Large Industrial Complexes", description: "Large industrial complexes requiring massive power" },
                          { title: "Utility-Scale Projects", description: "Utility-scale energy storage applications" },
                          { title: "Major Infrastructure", description: "Major infrastructure projects" },
                          { title: "Manufacturing Facilities", description: "Large manufacturing facilities" },
                        ]
                    ).map((scenario, index) => (
                      <div
                        key={index}
                        className="w-full md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] group bg-white rounded-xl p-4 md:p-5 border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        {('image' in scenario && scenario.image && (product.id === "cabinet-item4" || product.id === "cabinet-14" || product.id === "cabinet-15" || product.id === "cabinet-16")) ? (
                          <>
                            <div className="relative w-full h-32 md:h-40 mb-3 rounded-lg overflow-hidden bg-slate-100">
                              <Image
                                src={scenario.image}
                                alt={scenario.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="font-semibold text-sm md:text-base text-slate-900 mb-2">{scenario.title}</h4>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <RiMapPinLine className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                            <h4 className="font-semibold text-sm md:text-base text-slate-900">{scenario.title}</h4>
                          </div>
                        )}
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isSmartHomeProduct ? (
                <div className="space-y-4 md:space-y-6">
                  <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6">
                    {product.id === "smart-home-smp2" 
                      ? "Suitable for small houses, sari-sari stores, off-grid tiny homes, farm huts, and construction site offices."
                      : product.id === "smart-home-smp3"
                      ? "Suitable for urban homes, small clinics, small offices, BPO satellite offices, internet cafés, and small resort cottages."
                      : product.id === "smart-home-smp4"
                      ? "Suitable for rural homes with frequent long outages, stores with freezers requiring overnight operation, and small cell sites/telecom repeaters."
                      : product.id === "smart-home-smp5"
                      ? "Suitable for large homes with multiple AC units, small resorts or beach houses, restaurants, bakeries, small manufacturing, and community facilities."
                      : product.id === "smart-home-smp6"
                      ? "Suitable for off-grid homes or lodges that must run all night, cold storage rooms for small agri businesses, and small hospitals/clinics needing longer uptime."
                      : product.id === "smart-home-smp7"
                      ? "Suitable for off-grid homes or lodges that must run all night, cold storage rooms for small agri businesses, and small hospitals/clinics needing longer uptime."
                      : "Suitable for various places such as villas, small businesses, construction sites, farmer breeding, remote pastoral areas, islands, communication base stations, etc."
                    }
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {(product.id === "smart-home-smp2" 
                      ? [
                          { title: "Small Houses", description: "Backup power for small houses during brownouts", image: "/Product/SmartHome/2B/loc1.png" },
                          { title: "Small Businesses", description: "Sari-sari store lights + small freezer for a few hours", image: "/Product/SmartHome/2B/loc2.png" },
                          { title: "Construction Sites", description: "Construction site office power supply", image: "/Product/SmartHome/2B/loc3.png" },
                          { title: "Off-Grid Tiny Homes", description: "Power for off-grid tiny homes and farm huts", image: "/Product/SmartHome/2B/loc4.png" },
                          { title: "Farm Huts", description: "Rural farm hut power solutions", image: "/Product/SmartHome/2B/loc5.png" },
                        ]
                      : product.id === "smart-home-smp3"
                      ? [
                          { title: "Urban Homes", description: "Backup power for urban homes during long brownouts", image: "/Product/SmartHome/3B/loc1.png" },
                          { title: "Small Clinics", description: "Power supply for small medical clinics", image: "/Product/SmartHome/3B/loc2.png" },
                          { title: "Small Offices", description: "Backup power for small office spaces", image: "/Product/SmartHome/3B/loc3.png" },
                          { title: "BPO Satellite Offices", description: "Power for BPO satellite office locations", image: "/Product/SmartHome/3B/loc4.png" },
                          { title: "Internet Cafés", description: "Reliable power for internet café operations", image: "/Product/SmartHome/3B/loc5.png" },
                          { title: "Resort Cottages", description: "Small resort cottage / Airbnb unit power supply", image: "/Product/SmartHome/3B/loc6.png" },
                        ]
                      : product.id === "smart-home-smp4"
                      ? [
                          { title: "Rural Homes", description: "Rural homes with frequent long outages", image: "/Product/SmartHome/4B/loc1.png" },
                          { title: "Stores with Freezers", description: "Stores with freezers (meat, ice cream) that must stay cold overnight", image: "/Product/SmartHome/4B/loc2.png" },
                          { title: "Cell Sites", description: "Small cell sites/telecom repeaters wanting longer autonomy", image: "/Product/SmartHome/4B/loc3.png" },
                          { title: "Telecom Repeaters", description: "Telecom infrastructure requiring extended backup power", image: "/Product/SmartHome/4B/loc4.png" },
                          { title: "Long Outage Areas", description: "Areas with frequent and extended power outages", image: "/Product/SmartHome/4B/loc5.png" },
                          { title: "Cold Storage", description: "Commercial applications requiring overnight refrigeration", image: "/Product/SmartHome/4B/loc6.png" },
                        ]
                      : product.id === "smart-home-smp5"
                      ? [
                          { title: "Large Homes", description: "Large homes with multiple AC units", image: "/Product/SmartHome/5B/loc1.png" },
                          { title: "Resorts & Beach Houses", description: "Small resorts or beach houses (several rooms + common area)", image: "/Product/SmartHome/5B/loc2.png" },
                          { title: "Restaurants", description: "Restaurants requiring reliable power for operations", image: "/Product/SmartHome/5B/loc3.png" },
                          { title: "Bakeries", description: "Bakeries with light machinery and equipment", image: "/Product/SmartHome/5B/loc4.png" },
                          { title: "Small Manufacturing", description: "Small manufacturing with light machinery", image: "/Product/SmartHome/5B/loc5.png" },
                          { title: "Community Facilities", description: "Barangay halls, schools, classrooms, and evacuation centers", image: "/Product/SmartHome/5B/loc6.png" },
                        ]
                      : product.id === "smart-home-smp6"
                      ? [
                          { title: "Off-Grid Homes", description: "Off-grid homes or lodges that must run all night", image: "/Product/SmartHome/6B/loc1.png" },
                          { title: "Cold Storage", description: "Cold storage rooms for small agri businesses", image: "/Product/SmartHome/6B/loc2.png" },
                          { title: "Small Hospitals", description: "Small hospitals/clinics needing longer uptime for equipment", image: "/Product/SmartHome/6B/loc3.png" },
                          { title: "Clinics", description: "Small-scale medical facilities requiring extended backup", image: "/Product/SmartHome/6B/loc4.png" },
                          { title: "All-Night Operations", description: "Applications requiring full day-night cycle backup", image: "/Product/SmartHome/6B/loc5.png" },
                          { title: "Extended Backup", description: "Systems needing longer-lasting storage for moderate loads", image: "/Product/SmartHome/6B/loc6.png" },
                        ]
                      : product.id === "smart-home-smp7"
                      ? [
                          { title: "Off-Grid Homes", description: "Off-grid homes or lodges that must run all night", image: "/Product/SmartHome/6B/loc1.png" },
                          { title: "Cold Storage", description: "Cold storage rooms for small agri businesses", image: "/Product/SmartHome/6B/loc2.png" },
                          { title: "Small Hospitals", description: "Small hospitals/clinics needing longer uptime for equipment", image: "/Product/SmartHome/6B/loc3.png" },
                          { title: "Clinics", description: "Small-scale medical facilities requiring extended backup", image: "/Product/SmartHome/6B/loc4.png" },
                          { title: "All-Night Operations", description: "Applications requiring full day-night cycle backup", image: "/Product/SmartHome/6B/loc5.png" },
                          { title: "Extended Backup", description: "Systems needing longer-lasting storage for moderate loads", image: "/Product/SmartHome/6B/loc6.png" },
                        ]
                      : [
                          { title: "Villas", description: "Residential solar power for luxury homes" },
                          { title: "Small Businesses", description: "Commercial solar solutions for shops and stores" },
                          { title: "Construction Sites", description: "Temporary power for construction projects" },
                          { title: "Farmer Breeding", description: "Agricultural and farming applications" },
                          { title: "Remote Pastoral Areas", description: "Off-grid power for remote locations" },
                          { title: "Islands", description: "Island communities and marine applications" },
                          { title: "Communication Base Stations", description: "Power for telecom infrastructure" },
                          { title: "Remote Mountainous Areas", description: "Mountain and high-altitude installations" },
                          { title: "Power Shortage Areas", description: "Backup power for areas with unreliable grid" },
                          { title: "Fishery Aquaculture", description: "Aquaculture and fishery operations" },
                        ]
                    ).map((scenario, index) => (
                      <div
                        key={index}
                        className="w-full md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] group bg-white rounded-xl p-4 md:p-5 border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        {('image' in scenario && scenario.image && (product.id === "smart-home-smp2" || product.id === "smart-home-smp3" || product.id === "smart-home-smp4" || product.id === "smart-home-smp5" || product.id === "smart-home-smp6" || product.id === "smart-home-smp7")) ? (
                          <>
                            <div className="relative w-full h-32 md:h-40 mb-3 rounded-lg overflow-hidden bg-slate-100">
                              <Image
                                src={scenario.image}
                                alt={scenario.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="font-semibold text-sm md:text-base text-slate-900 mb-2">{scenario.title}</h4>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <RiMapPinLine className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                              </div>
                              <h4 className="font-semibold text-sm md:text-base text-slate-900">{scenario.title}</h4>
                            </div>
                          </>
                        )}
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
              <div className="flex flex-wrap gap-4 md:gap-6">
                {product.id === "solar-street-f2l" ? (
                  <>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/f2/proj1.png"
                          alt="City Arterial Safety Lighting"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">City Arterial Safety Lighting</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Bright, even illumination for wide municipal roads and night traffic.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/f2/proj2.png"
                          alt="Industrial Access Road Retrofit"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Industrial Access Road Retrofit</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Reliable solar lighting that secures logistics lanes and factory perimeters.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/f2/proj3.png"
                          alt="Residential Boulevard Comfort"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Residential Boulevard Comfort</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Inviting, well-lit neighborhood streets that feel safe for evening walks.</p>
                    </div>
                  </>
                ) : product.id === "solar-street-rklv02" ? (
                  <>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvq2/proj1.png"
                          alt="Township Main Road Upgrade"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Township Main Road Upgrade</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Daytime-ready solar lighting for growing residential corridors.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvq2/proj2.png"
                          alt="Palm Boulevard Showcase"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Palm Boulevard Showcase</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Elegant warm lighting for landscaped driveways and resort entries.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvq2/proj3.png"
                          alt="Parkside Night Safety"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Parkside Night Safety</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Stable illumination for greenways, community paths, and school routes.</p>
                    </div>
                  </>
                ) : product.id === "solar-street-rks" ? (
                  <>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc2/proj1.png"
                          alt="Smart City Daytime Showcase"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Smart City Daytime Showcase</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Orderly pole layout for modern boulevards and civic roads.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc2/proj2.png"
                          alt="Palm Avenue Nightscape"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Palm Avenue Nightscape</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Warm, decorative lighting for landscaped boulevards and resort drives.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc2/proj3.png"
                          alt="Park Trail Safety Lighting"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Park Trail Safety Lighting</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Comfortable pathway lighting for parks, riversides, and community jog routes.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc2/proj4.png"
                          alt="Expressway Interchange Guard"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Expressway Interchange Guard</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Bright coverage for curved exits and service roads to boost visibility.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc2/proj5.png"
                          alt="Perimeter Security Lane"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Perimeter Security Lane</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Reliable illumination for facility edges, rural lanes, and patrol routes.</p>
                    </div>
                  </>
                ) : product.id === "solar-street-lvxc" ? (
                  <>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj1.png"
                          alt="Urban Night Market Access"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Urban Night Market Access</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Bright, inviting streets that keep evening commerce active and safe.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj2.png"
                          alt="Coastal Boulevard Glow"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Coastal Boulevard Glow</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Resort-style lighting that highlights palm-lined seaside drives.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj3.png"
                          alt="Riverside Leisure Path"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Riverside Leisure Path</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Even, comfortable lighting for waterfront walks and bike routes.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj4.png"
                          alt="Campus Walking Lane"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Campus Walking Lane</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Safe, glare-free corridors for schools, universities, and parks.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj5.png"
                          alt="Industrial Park Spine"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Industrial Park Spine</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">High-output lighting to secure logistics roads and loading areas.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj6.png"
                          alt="Suburban Community Loop"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Suburban Community Loop</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Welcoming streetlight levels for neighborhoods and village roads.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj7.png"
                          alt="Hilltop Scenic Drive"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Hilltop Scenic Drive</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Clear visibility on winding elevation roads for safer night travel.</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/StreetLamp/lvxc3/proj8.png"
                          alt="Safe Village Connector"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Safe Village Connector</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Reliable illumination linking barangays, farms, and rural hubs.</p>
                    </div>
                  </>
                ) : product.id === "ev-charging-89" ? (
                  <>
                    <div className="group cursor-pointer w-full md:w-[calc(25%-1.125rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/EV/green/96.jpg"
                          alt="Office building parking lot"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Office building parking lot</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Ideal for corporate and business facilities</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(25%-1.125rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/EV/green/97.jpg"
                          alt="Residential community"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Residential community</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Perfect for apartment complexes and housing developments</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(25%-1.125rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/EV/green/98.jpg"
                          alt="Commercial parking lot"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Commercial parking lot</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Suitable for shopping centers and retail facilities</p>
                    </div>
                    <div className="group cursor-pointer w-full md:w-[calc(25%-1.125rem)]">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <Image
                          src="/Product/EV/green/99.jpg"
                          alt="Small enterprise parking lot"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg">Small enterprise parking lot</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">Perfect for small businesses and local enterprises</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Dynamically render variations with images for EV products */}
                    {details?.variations?.filter((v) => v.image).length > 0 ? (
                      details.variations
                        .filter((v) => v.image)
                        .map((space, index) => (
                          <div key={index} className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                              <Image
                                src={space.image!}
                                alt={space.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="font-bold text-white text-lg">{space.name}</h4>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 text-center">{space.description || space.value}</p>
                          </div>
                        ))
                    ) : (
                      <>
                        {/* Fallback to default images if no variations with images */}
                        <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <Image
                              src="/Product/EV/small/83.jpg"
                              alt="Apartment parking spaces"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="font-bold text-white text-lg">Apartment parking spaces</h4>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 text-center">Ideal for residential complexes and multi-unit buildings</p>
                        </div>
                        <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <Image
                              src="/Product/EV/small/84.jpg"
                              alt="Enterprise parking spaces"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="font-bold text-white text-lg">Enterprise parking spaces</h4>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 text-center">Perfect for commercial and office parking facilities</p>
                        </div>
                        <div className="group cursor-pointer w-full md:w-[calc(33.333%-1rem)]">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <Image
                              src="/Product/EV/small/85.jpg"
                              alt="Private parking spaces"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="font-bold text-white text-lg">Private parking spaces</h4>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 text-center">Suitable for individual homes and private garages</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section - Before CTA */}
      <div className="mt-8 md:mt-12 space-y-4 md:space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
          <RiQuestionLine className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3 md:space-y-4">
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>What is the installation time for this product?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              Installation typically takes 2-4 hours for standard setups. Our certified technicians handle the entire process, including site assessment, mounting, and system configuration.
            </p>
          </details>
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>What warranty coverage is included?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              All products come with a comprehensive 3-year warranty covering manufacturing defects, parts replacement, and technical support.
            </p>
          </details>
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>Is maintenance required?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              Our products are designed for minimal maintenance. We recommend annual inspections and cleaning. Our maintenance service packages are available for hassle-free upkeep.
            </p>
          </details>
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>What payment and financing options are available?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <div className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>Payment Term:</strong> 30% bank transfer in advance, the balance before shipping.
              </p>
              <p>
                <strong>Price Validity:</strong> The price is valid for 15 days since the quotation date.
              </p>
              <p>
                <strong>Production Time:</strong> 20-25 working days after receiving the payment.
              </p>
              <p>
                <strong>Package:</strong> Standard Export package.
              </p>
            </div>
          </details>
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>Can I get a custom configuration?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              Yes! We offer custom configurations to meet your specific requirements. Contact our sales team to discuss your needs and get a tailored solution.
            </p>
          </details>
          <details className="group bg-slate-50 rounded-lg border border-slate-200 p-4 md:p-5">
            <summary className="font-semibold text-slate-900 cursor-pointer text-sm md:text-base flex items-center justify-between">
              <span>How do I determine what size system I need?</span>
              <span className="text-primary text-xl">+</span>
            </summary>
            <div className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed space-y-4">
              <div>
                <p className="font-semibold text-slate-900 mb-2">A simple way to explain to customers:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-slate-500">
                  <li><strong>kWh (battery):</strong> How long it can run when the sun is gone.</li>
                  <li><strong>kW (rated power):</strong> How many appliances/machines can run at the same time.</li>
                  <li><strong>Panels (number of 670W pcs):</strong> How fast you can recharge the batteries each day.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">So:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-500">
                  <li><strong>Smaller models (40-60 kWh, 20-30 kW):</strong> Single business or small compound.</li>
                  <li><strong>Mid models (80-100 kWh, 40-50 kW):</strong> School, resort, or barangay center.</li>
                  <li><strong>Big models (215-261 kWh, 100-110 kW):</strong> Whole small community or industrial site.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">Ask the customer:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>
                    <strong>What do you want to power?</strong>
                    <p className="ml-4 text-slate-500">List appliances and their wattage (AC, ref, freezer, pump, computers, etc.).</p>
                  </li>
                  <li>
                    <strong>How many hours per day and during brownouts?</strong>
                    <p className="ml-4 text-slate-500">More hours needed → higher kWh.</p>
                  </li>
                  <li>
                    <strong>What&apos;s the maximum they might run at the same time?</strong>
                    <p className="ml-4 text-slate-500">Higher simultaneous load → higher kW.</p>
                  </li>
                  <li>
                    <strong>Is this for backup only or daily off-grid use?</strong>
                    <ul className="ml-4 list-disc list-inside text-slate-500 mt-1">
                      <li>Backup only: can choose smaller kWh if outages are short.</li>
                      <li>Off-grid: usually 15–30 kWh models.</li>
                    </ul>
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">Rule of thumb for the Philippines:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-500">
                  <li><strong>Basic rural home (no AC)</strong> – 5 kWh or 10 kWh</li>
                  <li><strong>Middle-class home with 1–2 AC units</strong> – 10–20 kWh</li>
                  <li><strong>Large house / small business</strong> – 20–30 kWh</li>
                  <li><strong>Resort, small factory, island microgrid</strong> – 20–30 kWh (maybe multiple units)</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Related Products</h2>
          <div className="overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-4 md:gap-6 min-w-max">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group flex-shrink-0 w-64 md:w-80 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer snap-start"
                >
                  <div className="relative overflow-hidden bg-slate-100">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      width={320}
                      height={200}
                      className="w-full h-40 md:h-48 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-70" />
                  </div>
                  <div className="p-4 md:p-5 flex flex-col gap-2">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      {categoryLabel}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{relatedProduct.subtitle}</p>
                    {relatedProduct.tag && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 w-fit">
                        {relatedProduct.tag}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 md:p-8 text-white text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
          Interested in this product?
        </h3>
        <p className="text-sm md:text-base text-blue-100 mb-4 md:mb-6">
          Contact us for pricing, availability, and custom configurations
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
          <Link
            href={`/contact?subject=quote&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}&quantity=${quantity}`}
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-sm md:text-base"
          >
            Get Quote
          </Link>
          <Link
            href={`/contact?subject=demo&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}`}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm md:text-base"
          >
            <RiCalendarLine className="h-4 w-4" />
            Request Demo
          </Link>
          <Link
            href={`/contact?subject=brochure&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}`}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm md:text-base"
          >
            <RiDownloadLine className="h-4 w-4" />
            Download Brochure
          </Link>
        </div>
      </div>

      {/* Image Modal - Mobile & Desktop */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          onClick={closeImageModal}
        >
          {/* Close Button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"
            aria-label="Close image modal"
          >
            <RiCloseLine className="h-6 w-6 md:h-8 md:w-8" />
          </button>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateModalImage('prev');
                }}
                className="absolute left-4 md:left-8 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"
                aria-label="Previous image"
              >
                <RiArrowLeftSLine className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateModalImage('next');
                }}
                className="absolute right-4 md:right-8 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"
                aria-label="Next image"
              >
                <RiArrowRightSLine className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
              {modalImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={allImages[modalImageIndex]}
                alt={`${product.name} - Image ${modalImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
            </div>
          </div>

          {/* Thumbnail Navigation (Desktop) */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex(index);
                  }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    modalImageIndex === index
                      ? "border-white ring-2 ring-white/50 scale-110"
                      : "border-white/30 hover:border-white/60"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


