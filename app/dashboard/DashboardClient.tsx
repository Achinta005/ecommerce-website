'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  DollarSign, 
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Home
} from 'lucide-react';

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

interface DashboardClientProps {
  initialStats: DashboardStats;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'low-stock' | 'out-of-stock'>('low-stock');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStockLevel = (product: any) => {
    return product.inventory || product.stock || 0;
  };

  const filteredProducts = activeTab === 'low-stock' 
    ? stats.lowStockProducts 
    : stats.outOfStockProducts;

  const searchedProducts = searchQuery
    ? filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {formatDate(stats.lastUpdated)}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-blue-500" size={24} />
            </div>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-sm text-gray-600">In Stock</p>
            <p className="text-3xl font-bold text-gray-900">{stats.inStockCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="text-yellow-500" size={24} />
            </div>
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-gray-900">{stats.lowStockCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-500" size={24} />
            </div>
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-3xl font-bold text-gray-900">{stats.outOfStockCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalInventoryValue)}
            </p>
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Category Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.categoryStats).slice(0, 6).map(([category, data]) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{category}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium">{data.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="font-medium">{data.totalStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Low Stock:</span>
                    <span className="font-medium text-yellow-600">{data.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Out of Stock:</span>
                    <span className="font-medium text-red-600">{data.outOfStock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('low-stock')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'low-stock'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Low Stock ({stats.lowStockCount})
                </button>
                <button
                  onClick={() => setActiveTab('out-of-stock')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === 'out-of-stock'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Out of Stock ({stats.outOfStockCount})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchedProducts.length > 0 ? (
                  searchedProducts.map((product) => {
                    const stockLevel = getStockLevel(product);
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || product.image || 'https://via.placeholder.com/50'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {typeof product.price === 'string' && product.price.includes(',')
                            ? `₹${product.price}`
                            : `$${product.price}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${
                            stockLevel === 0 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {stockLevel} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {stockLevel === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Low Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}