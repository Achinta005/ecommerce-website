import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function GET() {
  try {
    await connectDB();
    
    const categories = await Product.distinct('category');
    
    return NextResponse.json({ categories: categories.filter(Boolean) });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}