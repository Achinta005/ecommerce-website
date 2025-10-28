'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Star, Filter,CircleGauge,ShieldUser } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number;
  slug: string;
  category: string;
  rating?: number;
  images?: string[];
  inventory?: number;
  description?: string;
  lastUpdated?: string;
}

interface HomeProps {
  products: Product[];
}

export default function Home({ products }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const router = useRouter();

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.price !== undefined)
      .filter(product => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;

        let matchesPrice = true;
        if (priceRange === 'Under $50') matchesPrice = product.price! < 50;
        else if (priceRange === '$50-$100')
          matchesPrice = product.price! >= 50 && product.price! <= 100;
        else if (priceRange === 'Over $100') matchesPrice = product.price! > 100;

        return matchesSearch && matchesCategory && matchesPrice;
      });
  }, [products, searchQuery, selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
            <div className='flex flex-row gap-3'>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer" onClick={()=>router.push('/dashboard')}>
                <CircleGauge size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"onClick={()=>router.push('/admin')}>
                <ShieldUser size={20} />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Welcome to ShopHub</h2>
          <p className="text-lg opacity-90">Discover amazing products at great prices</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="All">All Prices</option>
              <option value="Under $50">Under $50</option>
              <option value="$50-$100">$50 - $100</option>
              <option value="Over $100">Over $100</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer"
                onClick={() => router.push(`/products/${product.slug}`)}
              >
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {product.rating ?? 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price?.toFixed(2)}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No products found matching your criteria
            </p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 ShopHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}