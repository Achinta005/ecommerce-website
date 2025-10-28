import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    const productsWithImages = products.map(p => ({
      ...p._doc,
      images: p.images || []
    }));
    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    console.log("📦 Incoming Product Body:", body);

    const product = new Product(body);
    await product.save();

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to store Product" }, { status: 500 });
  }
}
