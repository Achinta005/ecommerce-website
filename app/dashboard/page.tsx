import DashboardClient from './DashboardClient';
import { connectDB } from '@/app/lib/db';
import Product from '@/app/model/product';

interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  totalInventoryValue: number;
  lowStockProducts: any[];
  outOfStockProducts: any[];
  categoryStats: Record<string, any>;
  lastUpdated: string;
}

async function getDashboardData(): Promise<DashboardStats> {
  try {
    await connectDB();

    const products = await Product.find({}).lean();

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

    const totalValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'string' 
        ? parseFloat(p.price.replace(/,/g, '')) 
        : p.price || 0;
      const stock = p.inventory || p.stock || 0;
      return sum + (price * stock);
    }, 0);

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
    }, {} as Record<string, any>);

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      inStockCount: inStockProducts.length,
      totalInventoryValue: totalValue,
      lowStockProducts: lowStockProducts.slice(0, 10).map(p => ({
        ...p,
        _id: p._id.toString()
      })),
      outOfStockProducts: outOfStockProducts.slice(0, 10).map(p => ({
        ...p,
        _id: p._id.toString()
      })),
      categoryStats,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      inStockCount: 0,
      totalInventoryValue: 0,
      lowStockProducts: [],
      outOfStockProducts: [],
      categoryStats: {},
      lastUpdated: new Date().toISOString()
    };
  }
}

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardData();
  
  return <DashboardClient initialStats={stats} />;
}
