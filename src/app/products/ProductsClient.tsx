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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBanner, setCategoryBanner] = useState<Record<string, any>>({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Fetch products, categories, and banners from API
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const categoryParam = activeCategory !== "all" ? activeCategory : null;
        const params = new URLSearchParams();
        if (categoryParam) params.set("category", categoryParam);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const response = await fetch(`/api/products?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setProducts(result.data.products || []);
          setCategories(result.data.categories || []);
          setCategoryBanner(result.data.categoryBanner || {});
          setTotalProducts(result.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, searchQuery]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products
    .filter((p) => {
      if (!normalizedQuery) return true;
      const haystack = [
        p.name,
        p.subtitle,
        p.tag,
        p.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

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
              <ProductGrid
                products={filteredProducts}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                categories={categories}
                totalProducts={totalProducts}
              />
            )}
          </div>
        </LayoutContainer>
      </section>

      {showBackToTop && <BackToTopButton />}
    </main>
  );
}


