import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getResourceBySlug, resources } from "@/app/(home)/components/homeData";
import BlogDetail from "./components/BlogDetail";
import LayoutContainer from "@/components/layout/LayoutContainer";

export async function generateStaticParams() {
  return resources
    .filter((resource) => resource.slug)
    .map((resource) => ({
      slug: resource.slug!,
    }));
}

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    return {
      title: "Blog Post Not Found | VoltHub",
      description: "The requested blog post could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volthubs.netlify.app";
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const imageUrl = resource.image.startsWith("http") ? resource.image : `${siteUrl}${resource.image}`;

  // Get article metadata from blogContent if available
  const blogContent: Record<string, { author?: string; date?: string; readingTime?: string }> = {
    "complete-guide-to-solar-energy-storage": {
      author: "VoltHub Energy Team",
      date: "2025-01-28",
      readingTime: "5 mins",
    },
    "ev-charging-infrastructure-future-of-transportation": {
      author: "VoltHub Mobility Team",
      date: "2025-01-28",
      readingTime: "8 mins",
    },
    "energy-savings-calculator-roi-analysis": {
      author: "VoltHub Finance Team",
      date: "2025-01-28",
      readingTime: "5 mins",
    },
    "smart-grid-integration-powering-the-future": {
      author: "VoltHub Technology Team",
      date: "2025-01-28",
      readingTime: "6 mins",
    },
    "commercial-energy-solutions-business-guide": {
      author: "VoltHub Commercial Team",
      date: "2025-01-28",
      readingTime: "7 mins",
    },
  };

  const articleMeta = blogContent[slug] || {
    author: "VoltHub Team",
    date: new Date().toISOString().split("T")[0],
    readingTime: "5 mins",
  };

  return {
    title: `${resource.title} | VoltHub Blog`,
    description: resource.description,
    keywords: [
      resource.type.toLowerCase(),
      "energy storage",
      "EV charging",
      "solar energy",
      "renewable energy",
      "VoltHub",
      ...resource.title.toLowerCase().split(" ").slice(0, 5),
    ],
    authors: articleMeta.author ? [{ name: articleMeta.author }] : undefined,
    openGraph: {
      title: resource.title,
      description: resource.description,
      url: articleUrl,
      siteName: "VoltHub Energy",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: resource.imageAlt || resource.title,
        },
      ],
      type: "article",
      publishedTime: articleMeta.date || undefined,
      authors: articleMeta.author ? [articleMeta.author] : undefined,
      section: resource.type,
    },
    twitter: {
      card: "summary_large_image",
      title: resource.title,
      description: resource.description,
      images: [imageUrl],
      creator: "@VoltHubEnergy",
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      ...(articleMeta.author && { "article:author": articleMeta.author }),
      ...(articleMeta.date && { "article:published_time": articleMeta.date }),
      ...(articleMeta.readingTime && { "article:reading_time": articleMeta.readingTime }),
      "article:section": resource.type,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <LayoutContainer className="py-8 md:py-12 lg:py-16">
        <BlogDetail resource={resource} />
      </LayoutContainer>
    </main>
  );
}

