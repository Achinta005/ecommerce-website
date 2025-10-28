import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { inventory, inStock, stock } = body;

    const updateData: any = {};
    if (inventory !== undefined) updateData.inventory = inventory;
    if (stock !== undefined) updateData.stock = stock;
    if (inStock !== undefined) updateData.inStock = inStock;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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