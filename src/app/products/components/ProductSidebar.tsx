"use client";

import { RiArrowRightSLine, RiAppsLine, RiChargingPile2Line, RiSunLine, RiHomeGearLine, RiBatteryChargeLine } from "react-icons/ri";
import { ProductCategory } from "./productData";

interface Category {
  id: ProductCategory;
  label: string;
}

interface ProductSidebarProps {
  activeCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  categories: Category[];
}

export default function ProductSidebar({
  activeCategory,
  onCategoryChange,
  categories,
}: ProductSidebarProps) {
  // Get icon for each category
  const getCategoryIcon = (categoryId: ProductCategory) => {
    switch (categoryId) {
      case "all":
        return RiAppsLine;
      case "ev-charging":
        return RiChargingPile2Line;
      case "solar-street":
        return RiSunLine;
      case "smart-home":
        return RiHomeGearLine;
      case "cabinet":
        return RiBatteryChargeLine;
      default:
        return RiAppsLine;
    }
  };

  return (
    <>
      {/* Mobile: Horizontal scrollable category filter */}
      <div className="md:hidden mb-6 w-full">
        <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = getCategoryIcon(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <aside className="hidden md:block w-[260px] lg:w-[280px] space-y-3 self-start shrink-0 p-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const Icon = getCategoryIcon(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center justify-between rounded-2xl px-5 py-4 text-left text-sm lg:text-base transition-all shadow-sm
                ${
                  isActive
                    ? "bg-white text-slate-900 ring-2 ring-primary/70 shadow-md"
                    : "bg-white/60 text-slate-700 hover:bg-white hover:shadow-md"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-primary" : "text-slate-500"
                  }`}
                />
                <span>{category.label}</span>
              </div>
              <RiArrowRightSLine
                className={`h-5 w-5 shrink-0 ${
                  isActive ? "text-primary" : "text-slate-400"
                }`}
              />
            </button>
          );
        })}

        <div className="hidden lg:block mt-4 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white px-5 py-4 text-xs space-y-1">
          <p className="font-semibold text-sm">
            Trusted Energy Storage Supplier
          </p>
          <p className="text-white/70">
            Certified safety, bankable performance and global project experience.
          </p>
        </div>
      </aside>
    </>
  );
}


