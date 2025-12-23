import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LayoutContainer from "@/components/layout/LayoutContainer";
import ProductDetail from "../components/ProductDetail";
import { getProductById } from "../components/productData";
import BackToTopButton from "@/components/common/BackToTopButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="bg-slate-50 min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 flex  items-center justify-center">
      <LayoutContainer>
        <ProductDetail product={product} />
        <BackToTopButton />
      </LayoutContainer>
    </main>
  );
}


