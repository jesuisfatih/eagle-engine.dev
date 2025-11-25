'use client';

import { useState } from 'react';

export default function CartPage() {
  const [cartItems] = useState([
    {
      id: '1',
      title: 'Premium Laptop Stand',
      variant: 'Black / Metal',
      quantity: 2,
      unitPrice: 37.49,
      listPrice: 49.99,
      image: 'https://via.placeholder.com/80',
    },
    {
      id: '2',
      title: 'Wireless Keyboard',
      variant: 'White / Mechanical',
      quantity: 1,
      unitPrice: 59.99,
      listPrice: 79.99,
      image: 'https://via.placeholder.com/80',
    },
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const savings = cartItems.reduce((sum, item) => sum + (item.listPrice - item.unitPrice) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0">
                    <img src={item.image} alt={item.title} className="h-20 w-20 rounded-lg object-cover" />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.variant}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="font-bold text-blue-600">${item.unitPrice}</span>
                        <span className="text-sm text-gray-500 line-through">${item.listPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50">-</button>
                      <span className="font-medium">{item.quantity}</span>
                      <button className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50">+</button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <button className="mt-1 text-sm text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Total Savings</span>
                  <span className="font-semibold text-green-600">-${savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                Proceed to Checkout
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    </div>
  );
}



