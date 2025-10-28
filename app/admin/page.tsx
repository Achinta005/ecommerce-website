'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Home,
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
  Package
} from 'lucide-react';

interface Product {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  price: string | number;
  category: string;
  description: string;
  images?: string[];
  image?: string;
  inventory?: number;
  stock?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  features?: string[];
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    price: '0',
    category: '',
    description: '',
    images: [''],
    inventory: 0,
    inStock: true,
    rating: 0,
    reviewCount: 0,
    features: ['']
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => {
      const images = [...(prev.images || [''])];
      images[index] = value;
      return { ...prev, images };
    });
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || ['']), '']
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || ['']).filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => {
      const features = [...(prev.features || [''])];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || ['']), '']
    }));
  };

  const removeFeatureField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || ['']).filter((_, i) => i !== index)
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      price: '0',
      category: '',
      description: '',
      images: [''],
      inventory: 0,
      inStock: true,
      rating: 0,
      reviewCount: 0,
      features: ['']
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      price: product.price || '0',
      category: product.category || '',
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images : [''],
      inventory: product.inventory || product.stock || 0,
      inStock: product.inStock !== false,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      features: product.features && product.features.length > 0 ? product.features : ['']
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.name || !formData.slug || !formData.price || !formData.category) {
        showNotification('error', 'Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const submitData = {
        ...formData,
        images: (formData.images || ['']).filter(img => img.trim() !== ''),
        features: (formData.features || ['']).filter(f => f.trim() !== ''),
        id: formData.id || `product-${Date.now()}`
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.slug}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      showNotification('success', `Product ${editingProduct ? 'updated' : 'created'} successfully`);
      closeModal();
      fetchProducts();
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showNotification('error', error.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete product');

      showNotification('success', 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('error', 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
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
                              <p className="text-sm text-gray-500">{product.slug}</p>
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
                        <td className="px-6 py-4 text-sm">
                          <span className={`font-semibold ${
                            (product.inventory || product.stock || 0) === 0
                              ? 'text-red-600'
                              : (product.inventory || product.stock || 0) <= 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {product.inventory || product.stock || 0} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <Package className="mx-auto mb-2 text-gray-400" size={48} />
                        <p>No products found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="product-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="99.99 or 2,999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    list="categories"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter or select category"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventory (Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.inventory}
                    onChange={(e) => handleInputChange('inventory', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => handleInputChange('inStock', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="space-y-2">
                  {(formData.images || ['']).map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add another image
                  </button>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {(formData.features || ['']).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter product feature"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeFeatureField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add another feature
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}