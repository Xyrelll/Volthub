"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LayoutContainer from "@/components/layout/LayoutContainer";
import ProductDetail from "../components/ProductDetail";
import type { Product } from "../components/productData";

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch from API route - this will be visible in Network tab
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            setError(`Failed to load product: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (!result.success) {
          setError(result.error || "Failed to load product");
          setLoading(false);
          return;
        }

        setProduct(result.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-slate-50 min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 flex items-center justify-center">
        <LayoutContainer>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </LayoutContainer>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-slate-50 min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 flex items-center justify-center">
        <LayoutContainer>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The requested product could not be found."}</p>
            <button
              onClick={() => router.push("/products")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </LayoutContainer>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 flex items-center justify-center">
      <LayoutContainer>
        <ProductDetail product={product} />
      </LayoutContainer>
    </main>
  );
}

