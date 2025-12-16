"use client";

import { RiArrowRightSLine } from "react-icons/ri";
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
  return (
    <>
      {/* Mobile: Horizontal scrollable category filter */}
      <div className="md:hidden mb-6 w-full">
        <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <aside className="hidden md:block w-[260px] lg:w-[280px] space-y-3 self-start flex-shrink-0 p-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
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
              <span>{category.label}</span>
              <RiArrowRightSLine
                className={`h-5 w-5 ${
                  isActive ? "text-primary" : "text-slate-400"
                }`}
              />
            </button>
          );
        })}

        <div className="hidden lg:block mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white px-5 py-4 text-xs space-y-1">
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


