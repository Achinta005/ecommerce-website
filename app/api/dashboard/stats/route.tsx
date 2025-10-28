import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

export async function GET() {
  try {
    await connectDB();

    // Fetch all products
    const products = await Product.find({}).lean();

    // Calculate statistics
    const totalProducts = products.length;
    
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => {
      const stock = p.inventory || p.stock || 0;
      return stock > 0 && stock <= lowStockThreshold;
    });

    const outOfStockProducts = products.filter(p => {
      const stock = p.inventory || p.stock || 0;
      return stock === 0 || p.inStock === false;
    });

    const inStockProducts = products.filter(p => {
      const stock = p.inventory || p.stock || 0;
      return stock > lowStockThreshold;
    });

    // Calculate total inventory value (parse price strings)
    const totalValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'string' 
        ? parseFloat(p.price.replace(/,/g, '')) 
        : p.price || 0;
      const stock = p.inventory || p.stock || 0;
      return sum + (price * stock);
    }, 0);

    // Get category-wise breakdown
    const categoryStats = products.reduce((acc, p) => {
      const category = p.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
      acc[category].count++;
      const stock = p.inventory || p.stock || 0;
      acc[category].totalStock += stock;
      
      if (stock === 0) acc[category].outOfStock++;
      else if (stock <= lowStockThreshold) acc[category].lowStock++;
      
      return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>);

    return NextResponse.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      inStockCount: inStockProducts.length,
      totalInventoryValue: totalValue,
      lowStockProducts: lowStockProducts.slice(0, 10), // Top 10 low stock items
      outOfStockProducts: outOfStockProducts.slice(0, 10),
      categoryStats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}