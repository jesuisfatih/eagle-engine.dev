'use client';

import { useState } from 'react';

export default function ProductsPage() {
  const [products] = useState([
    {
      id: '1',
      title: 'Premium Laptop Stand',
      vendor: 'TechGear',
      listPrice: 49.99,
      companyPrice: 37.49,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
    {
      id: '2',
      title: 'Wireless Keyboard',
      vendor: 'KeyMaster',
      listPrice: 79.99,
      companyPrice: 59.99,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
    {
      id: '3',
      title: 'Ergonomic Mouse',
      vendor: 'ComfortTech',
      listPrice: 39.99,
      companyPrice: 29.99,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
            <p className="mt-1 text-sm text-gray-500">Browse products with your exclusive B2B pricing</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square rounded-lg bg-gray-100 mb-4 flex items-center justify-center overflow-hidden">
                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-500">{product.vendor}</p>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-blue-600">${product.companyPrice}</span>
                  <span className="text-sm text-gray-500 line-through">${product.listPrice}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    Save {product.discount}%
                  </span>
                </div>

                <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    </div>
  );
}




