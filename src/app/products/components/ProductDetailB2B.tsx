"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  RiCheckLine,
  RiChat3Line,
  RiShieldCheckLine,
  RiAwardLine,
  RiDownloadLine,
  RiArrowRightSLine
} from "react-icons/ri";
import { Product, productDetails } from "./productData";

interface ProductDetailB2BProps {
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
  isCabinetProduct: boolean;
  isContainerProduct: boolean;
}

export default function ProductDetailB2B({
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
  isCabinetProduct,
  isContainerProduct,
}: ProductDetailB2BProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* ZONE A: Technical Visuals & ZONE C: Critical Specs at a Glance */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* ZONE A: Technical Visuals (Left Column - 60%) */}
        <div className="lg:w-[60%] space-y-4">
          {/* Main Product Image */}
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
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      className="object-contain p-1.5"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* ZONE C: Critical Specs at a Glance - Right under images */}
          {details && details.specifications && details.specifications.length > 0 && (
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
                Critical Specifications
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {/* Extract key specs: Voltage, Capacity, Power, Dimensions, Warranty */}
                {details.specifications
                  .filter((spec) => {
                    const lowerLabel = spec.label.toLowerCase();
                    return (
                      lowerLabel.includes("voltage") ||
                      lowerLabel.includes("capacity") ||
                      (lowerLabel.includes("power") && (lowerLabel.includes("rated") || lowerLabel.includes("output"))) ||
                      lowerLabel.includes("dimension") ||
                      lowerLabel.includes("warranty") ||
                      lowerLabel.includes("model") ||
                      lowerLabel.includes("battery") ||
                      lowerLabel.includes("solar panel")
                    );
                  })
                  .slice(0, 6)
                  .map((spec, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium mb-1">{spec.label}</div>
                      <div className="text-sm md:text-base font-semibold text-slate-900">{spec.value}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ZONE B: The Procurement Engine (Right Column - 40%) */}
        <div className="lg:w-[40%]">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm sticky top-24 space-y-5 md:space-y-6">
            {/* 1. Identity - Product Name & SKU/Model Number */}
            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                {categoryLabel}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-2">
                {displayProductName}
              </h1>
              <p className="text-base md:text-lg text-slate-600 mb-3">{product.subtitle}</p>
              
              {/* SKU/Model Number - Critical for B2B */}
              {details?.specifications?.find(s => s.label.toLowerCase().includes("model") || s.label.toLowerCase().includes("product name")) && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium mb-1">Model / SKU</div>
                  <div className="text-base font-mono font-semibold text-slate-900">
                    {details.specifications.find(s => s.label.toLowerCase().includes("model") || s.label.toLowerCase().includes("product name"))?.value || product.id}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Certifications - Paramount for Government Buyers */}
            <div className="pt-2 border-t border-slate-200">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-3">Certifications & Compliance</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <RiShieldCheckLine className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>CE Certified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <RiAwardLine className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>ISO 9001:2015</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <RiCheckLine className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>UL Listed (where applicable)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <RiShieldCheckLine className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>5-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* 3. Pricing Strategy - B2B Appropriate */}
            <div className="pt-2 border-t border-slate-200">
              {(() => {
                // For high-value items (cabinet products), show "Call for Pricing"
                // For smaller items (solar street lights), show base price with bulk discount note
                const isHighValue = isCabinetProduct || isContainerProduct;
                const isSmallItem = product.category === "solar-street";
                
                if (isHighValue) {
                  return (
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                        Call for Pricing
                      </div>
                      <p className="text-sm text-slate-600">
                        Contact us for contractor pricing and bulk order discounts
                      </p>
                    </div>
                  );
                } else if (isSmallItem && currentPrice) {
                  return (
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl md:text-4xl font-bold text-slate-900">
                          {currentPrice}
                        </span>
                        <span className="text-sm text-slate-500">base price</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-primary/5 rounded-lg p-2">
                        <strong>Bulk Discounts Available:</strong> Contact us for pricing on orders of 10+ units
                      </p>
                    </div>
                  );
                } else if (currentPrice) {
                  return (
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl md:text-4xl font-bold text-slate-900">
                          {currentPrice}
                        </span>
                        <span className="text-sm text-slate-500">per unit</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Volume pricing available for bulk orders
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                        Request Pricing
                      </div>
                      <p className="text-sm text-slate-600">
                        Contact us for detailed pricing and bulk order quotes
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* 4. Configuration & Volume - Technical Dropdowns */}
            {pricedVariations.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-sm md:text-base font-semibold text-slate-900 mb-3">
                  Technical Configuration
                </label>
                <select
                  value={selectedVariantIndex}
                  onChange={(e) => setSelectedVariantIndex(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base font-medium bg-white"
                >
                  {pricedVariations.map((variant, idx) => {
                    let label = variant.name;
                    const f2Match = variant.name.match(/(F2-\d+)/i);
                    const lvq2Match = variant.name.match(/(LVQ2-\d+)/i);
                    const lvxcMatch = variant.name.match(/(LVXC-\d+)/i);
                    const kWhMatch = variant.name.match(/(\d+\s*kWh)/i);
                    const kwMatch = variant.name.match(/(\d+\s*kW?)/i);
                    
                    if (f2Match) label = f2Match[1].toUpperCase();
                    else if (lvq2Match) label = lvq2Match[1].toUpperCase();
                    else if (lvxcMatch) label = lvxcMatch[1].toUpperCase();
                    else if (kWhMatch) label = kWhMatch[1];
                    else if (kwMatch) label = kwMatch[1];
                    else label = variant.name.split("–")[0]?.trim() || variant.name;
                    
                    return (
                      <option key={variant.name} value={idx}>
                        {label} {variant.price ? `- ${variant.price}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Bulk Quantity Input - For RFQ */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-sm md:text-base font-semibold text-slate-900 mb-3">
                Quantity (for bulk inquiries)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, value));
                }}
                placeholder="Enter quantity (e.g., 500)"
                className="w-full h-12 md:h-14 px-4 text-center text-lg md:text-xl font-semibold border-2 border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                For orders of 10+ units, please request a quote for volume pricing
              </p>
            </div>

            {/* 5. The CTAs - Procurement Focused */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              {/* Primary Action - Request RFQ */}
              <Link
                href={`/contact?subject=rfq&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}&quantity=${quantity}&model=${encodeURIComponent(details?.specifications?.find(s => s.label.toLowerCase().includes("model"))?.value || product.id)}`}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-bold px-6 py-4 md:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg md:text-xl group"
              >
                <span>Request a Quote (RFQ)</span>
                <RiArrowRightSLine className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Action - Download Spec Sheet */}
              <button
                onClick={() => {
                  // Generate or link to PDF spec sheet
                  const specSheetUrl = `/specs/${product.id}.pdf`; // You'll need to create these PDFs
                  window.open(specSheetUrl, '_blank');
                }}
                className="flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-primary font-semibold px-6 py-3 md:py-4 rounded-xl border-2 border-primary transition-all duration-300 text-base md:text-lg"
              >
                <RiDownloadLine className="h-5 w-5" />
                <span>Download Spec Sheet (PDF)</span>
              </button>

              {/* Tertiary - Contact Sales */}
              <Link
                href={`/contact?subject=sales&product=${encodeURIComponent(product.category)}&productName=${encodeURIComponent(displayProductName)}`}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-all duration-300 text-sm md:text-base"
              >
                <RiChat3Line className="h-4 w-4" />
                <span>Contact Sales Team</span>
              </Link>
            </div>

            {/* 6. Reassurance - B2B Logistics */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="text-xs md:text-sm text-slate-600 space-y-2">
                <p className="font-semibold text-slate-900">Procurement Support:</p>
                <p>✓ Custom configurations available</p>
                <p>✓ Technical documentation & CAD files</p>
                <p>✓ Project consultation & site assessment</p>
                <p>✓ Installation & commissioning services</p>
                <p>✓ Extended warranty options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

