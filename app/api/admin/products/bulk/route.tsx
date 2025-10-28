import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { ids } = await request.json();

    const result = await Product.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}