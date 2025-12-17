"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LayoutContainer from "@/components/layout/LayoutContainer";
import ProductBanner from "./components/ProductBanner";
import ProductSidebar from "./components/ProductSidebar";
import ProductGrid from "./components/ProductGrid";
import { ProductCategory, type Product } from "./components/productData";
import BackToTopButton from "@/components/common/BackToTopButton";

interface Category {
  id: ProductCategory;
  label: string;
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as ProductCategory | null;

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(
    categoryParam &&
      [
        "all",
        "ev-charging",
        "solar-street",
        "smart-home",
        "cabinet",
        "container",
      ].includes(categoryParam)
      ? categoryParam
      : "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBanner, setCategoryBanner] = useState<Record<string, any>>({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (
      categoryParam &&
      [
        "all",
        "ev-charging",
        "solar-street",
        "smart-home",
        "cabinet",
        "container",
      ].includes(categoryParam)
    ) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products, categories, and banners from API
  // Search is handled by the API, not client-side
  useEffect(() => {
    async function fetchProducts() {
      // Only show full loading spinner on initial load
      // For subsequent searches, show a subtle indicator
      const isInitialLoad = products.length === 0 && !searchQuery;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // User is searching, show subtle searching indicator
        setSearching(true);
      }

      try {
        const categoryParam = activeCategory !== "all" ? activeCategory : null;
        const params = new URLSearchParams();
        if (categoryParam) params.set("category", categoryParam);
        if (debouncedSearchQuery.trim()) {
          params.set("search", debouncedSearchQuery.trim());
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          // API already filters products based on search query
          setProducts(result.data.products || []);
          setCategories(result.data.categories || []);
          setCategoryBanner(result.data.categoryBanner || {});
          setTotalProducts(result.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setSearching(false);
      }
    }

    fetchProducts();
  }, [activeCategory, debouncedSearchQuery]);

  const showBackToTop = activeCategory === "all";

  return (
    <main className="bg-slate-50 min-h-screen overflow-x-hidden">
      {/* Hero / banner (changes with category) */}
      <ProductBanner activeCategory={activeCategory} categoryBanner={categoryBanner} categories={categories} />

      {/* Main layout: sidebar + grid */}
      <section className="py-6 md:py-10 lg:py-14">
        <LayoutContainer>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
            {/* Sidebar categories */}
            <ProductSidebar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categories={categories}
            />

            {/* Products grid */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative">
                {searching && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-600">Searching...</span>
                    </div>
                  </div>
                )}
                <ProductGrid
                  products={products}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  categories={categories}
                  totalProducts={totalProducts}
                />
              </div>
            )}
          </div>
        </LayoutContainer>
      </section>

      {showBackToTop && <BackToTopButton />}
    </main>
  );
}


