import type { Metadata } from "next";

export const metadata: Metadata = {
  // This will be overridden by generateMetadata in page.tsx
  title: "Blog Article | VoltHub",
  description: "Read the latest insights on energy storage, EV charging, and renewable energy solutions.",
};

export default function BlogArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

