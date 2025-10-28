import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }


    if (filter === 'low-stock') {
      query.$or = [
        { inventory: { $gt: 0, $lte: 10 } },
        { stock: { $gt: 0, $lte: 10 } }
      ];
    } else if (filter === 'out-of-stock') {
      query.$or = [
        { inventory: 0 },
        { stock: 0 },
        { inStock: false }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ inventory: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}