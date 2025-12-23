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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubsupabase.netlify.app";
  const productUrl = `${siteUrl}/products/${id}`;

  if (!product) {
    return {
      title: "Product Not Found - VoltHub",
      description: "The requested product could not be found.",
    };
  }

  const productImage = product.image?.startsWith("http") 
    ? product.image 
    : product.image?.startsWith("/")
    ? `${siteUrl}${product.image}`
    : product.images?.[0]?.startsWith("http")
    ? product.images[0]
    : product.images?.[0]?.startsWith("/")
    ? `${siteUrl}${product.images[0]}`
    : `${siteUrl}/HomeBanner/banner1.png`;

  const description = product.description ||
    `Learn more about ${product.name} from VoltHub. ${product.category} energy solution with specifications and pricing.`;

  return {
    title: `${product.name} - VoltHub`,
    description,
    keywords: [
      product.name.toLowerCase(),
      product.category,
      "energy solutions",
      "VoltHub products",
      ...(product.tag ? [product.tag.toLowerCase()] : []),
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: productUrl,
      siteName: "VoltHub Energy",
      title: `${product.name} - VoltHub`,
      description,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - VoltHub`,
      description,
      images: [productImage],
      creator: "@VoltHubEnergy",
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default function ProductPage() {
  // Use client component to fetch from API route (visible in Network tab)
  return <ProductDetailClient />;
}


