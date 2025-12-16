import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform product to match expected format (handle JSONB fields)
    const transformedProduct = {
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
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}





