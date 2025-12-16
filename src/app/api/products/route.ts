import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { ProductCategory } from "@/app/products/components/productData";

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ProductCategory | null;
    const search = searchParams.get("search")?.toLowerCase() || "";
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Build query
    let query = supabase.from("products").select("*", { count: "exact" });

    // Filter by category if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Filter by search query if provided (using PostgreSQL full-text search)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,subtitle.ilike.%${search}%,description.ilike.%${search}%,tag.ilike.%${search}%`
      );
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    if (limitNum) {
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    // Order by created_at (newest first)
    query = query.order("created_at", { ascending: false });

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Get all categories from database (or use static definition as fallback)
    const categories = [
      { id: "all" as ProductCategory, label: "All Products" },
      { id: "ev-charging" as ProductCategory, label: "EV Charging Station" },
      { id: "solar-street" as ProductCategory, label: "Solar Street Lights" },
      { id: "smart-home" as ProductCategory, label: "Smart Home IPS" },
      { id: "cabinet" as ProductCategory, label: "Power Supplies" },
    ];

    // Get all category banners
    const { data: banners } = await supabase
      .from("category_banners")
      .select("*");

    const categoryBanner: Record<string, any> = {};
    if (banners) {
      banners.forEach((banner) => {
        categoryBanner[banner.category] = {
          title: banner.title,
          description: banner.description,
          image: banner.image,
          video: banner.video,
        };
      });
    }

    // Get category banner if category is specified
    let categoryInfo = null;
    if (category && category !== "all") {
      categoryInfo = categoryBanner[category] || null;
    }

    // Transform products to match expected format (handle JSONB fields)
    const transformedProducts = (products || []).map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      tag: product.tag,
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      price: product.price,
      description: product.description,
      variations: Array.isArray(product.variations) ? product.variations : [],
      specifications: Array.isArray(product.specifications)
        ? product.specifications
        : [],
      features: Array.isArray(product.features) ? product.features : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        total: count || transformedProducts.length,
        categories,
        categoryBanner,
        categoryInfo,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: limitNum
            ? (offsetNum + limitNum < (count || 0))
            : false,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}





