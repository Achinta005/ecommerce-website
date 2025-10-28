'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  id?: string;
  slug: string;
  name: string;
  price: string | number;
  category: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  images?: string[];
  description: string;
  features?: string[];
  specifications?: { [key: string]: string };
  inStock?: boolean;
  stock?: number;
  inventory?: number;
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : ['https://via.placeholder.com/400']);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && (!product.stock || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition w-fit">
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {product.category}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">{product.rating || 'N/A'}</span>
                  <span className="text-gray-400">({product.reviewCount || 0} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {typeof product.price === 'string' && product.price.includes(',') 
                      ? `₹${product.price}` 
                      : `${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}
                  </span>
                  {(product.inStock !== false && (!product.stock || product.stock > 0) && (!product.inventory || product.inventory > 0)) ? (
                    <span className="text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={(product.inStock === false) || (product.stock ? quantity >= product.stock : false) || (product.inventory ? quantity >= product.inventory : false)}
                      className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                  {(product.stock || product.inventory) && (
                    <span className="text-sm text-gray-500">{product.stock || product.inventory} available</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={product.inStock === false || (product.stock === 0) || (product.inventory === 0)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition">
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">2 Year Warranty</p>
                    <p className="text-sm">Full coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t">
            <div className="max-w-4xl mx-auto p-6 lg:p-8">
              <div className="flex gap-6 border-b mb-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 font-medium transition ${
                    activeTab === 'description'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Description
                </button>
                {product.specifications && (
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`pb-3 font-medium transition ${
                      activeTab === 'specifications'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Specifications
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 font-medium transition ${
                    activeTab === 'reviews'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>

              {activeTab === 'description' && (
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-600">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && product.specifications && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}