import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    const product = await Product.findOne({ slug: slug });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productWithImages = {
      ...product._doc,
      images: product.images || [product.image]
    };

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const body = await request.json();
    const { slug } = await params;

    console.log("Updating Product:", slug, body);

    const product = await Product.findOneAndUpdate(
      { slug: slug },
      body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    console.log("Deleting Product:", slug);

    // Find and delete product by slug
    const product = await Product.findOneAndDelete({ slug: slug });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Product deleted successfully",
      product 
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}