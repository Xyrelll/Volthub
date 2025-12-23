import Image from "next/image";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import LayoutContainer from "@/components/layout/LayoutContainer";
import { resources } from "@/app/(home)/components/homeData";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
  description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology. Expert articles from VoltHub Energy.",
  keywords: [
    "energy storage blog",
    "EV charging news",
    "solar energy insights",
    "commercial energy solutions",
    "smart grid technology",
    "renewable energy articles",
    "energy efficiency guides",
    "VoltHub blog",
  ],
  openGraph: {
    title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
    description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology.",
    type: "website",
    url: "/blog",
    siteName: "VoltHub Energy",
    images: [
      {
        url: "/Blog/blogtitle.png",
        width: 1200,
        height: 630,
        alt: "VoltHub Blog - Energy Storage & EV Charging Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Latest Insights on Energy Storage & EV Charging - VoltHub",
    description: "Stay updated with the latest blogs, guides, and insights on commercial energy storage, EV charging infrastructure, solar energy, and smart grid technology.",
    images: ["/Blog/blogtitle.png"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLandingPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 mt-10">
      {/* Hero */}
      <section className="py-12 md:py-16 lg:py-20 border-b border-gray-100">
        <LayoutContainer className="text-center max-w-4xl mx-auto px-4">
          <p className="text-sm font-semibold tracking-[0.3em] text-accent uppercase">Learn &amp; Grow</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mt-4 mb-4">
            Latest Blogs &amp; Insights
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Stay updated with news, how-to guides, and deep dives on EV charging, solar, and smart energy.
          </p>
        </LayoutContainer>
      </section>

      {/* Blog Grid */}
      <section className="py-12 md:py-16 lg:py-20">
        <LayoutContainer>
          <div className="grid gap-6 md:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource, index) => (
              <Link
                key={resource.slug || index}
                href={resource.slug ? `/blog/${resource.slug}` : "#"}
                className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative w-full h-52 md:h-56 lg:h-64">
                  <Image
                    src={resource.image}
                    alt={resource.imageAlt || resource.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px, (min-width: 768px) 360px, 100vw"
                    priority={index === 0}
                  />
                </div>
                <div className="p-5 md:p-6 flex-1 flex flex-col gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide w-fit">
                    {resource.type}
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors duration-300">
                    {resource.title}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-3 flex-1">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300 text-sm md:text-base">
                    <span>Read More</span>
                    <RiArrowRightLine className="text-lg" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </LayoutContainer>
      </section>
    </main>
  );
}

