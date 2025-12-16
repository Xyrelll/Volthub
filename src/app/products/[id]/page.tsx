import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import type { Product } from "../components/productData";
import ProductDetailClient from "./ProductDetailClient";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProductForMetadata(id: string): Promise<Product | null> {
  try {
    const supabase = createServerClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle || "",
      category: product.category as Product["category"],
      tag: product.tag || undefined,
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      price: product.price || undefined,
      description: product.description || undefined,
      variations: Array.isArray(product.variations) ? product.variations : [],
      specifications: Array.isArray(product.specifications)
        ? product.specifications
        : [],
      features: Array.isArray(product.features) ? product.features : [],
    };
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForMetadata(id);

  if (!product) {
    return {
      title: "Product Not Found - VoltHub",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} - VoltHub`,
    description:
      product.description ||
      `Learn more about ${product.name} from VoltHub. ${product.category} energy solution with specifications and pricing.`,
  };
}

export default function ProductPage() {
  // Use client component to fetch from API route (visible in Network tab)
  return <ProductDetailClient />;
}


