'use client';

import { useState } from 'react';

export default function PricingPage() {
  const [rules] = useState([
    {
      id: '1',
      name: 'VIP Companies - 25% Off',
      target: 'Company Group: VIP',
      scope: 'All Products',
      discount: '25%',
      priority: 10,
      isActive: true,
      validUntil: '2024-12-31',
    },
    {
      id: '2',
      name: 'TechCorp Special - Electronics',
      target: 'Company: TechCorp Industries',
      scope: 'Collection: Electronics',
      discount: '$50 off',
      priority: 8,
      isActive: true,
      validUntil: null,
    },
    {
      id: '3',
      name: 'Bulk Order Discount',
      target: 'All Companies',
      scope: 'All Products',
      discount: 'Qty Breaks',
      priority: 5,
      isActive: true,
      validUntil: null,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Rules</h1>
          <p className="mt-1 text-sm text-gray-500">Configure custom pricing for your B2B customers</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <span className="flex items-center space-x-2">
            <iconify-icon icon="mdi:plus"></iconify-icon>
            <span>Create Rule</span>
          </span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Active Rules</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Companies Covered</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">18</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Avg Discount</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">18.5%</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Savings</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">$124K</p>
        </div>
      </div>

      {/* Rules List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search rules..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <iconify-icon icon="mdi:magnify"></iconify-icon>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option>All Types</option>
                <option>Percentage</option>
                <option>Fixed Amount</option>
                <option>Quantity Break</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <div key={rule.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      Priority: {rule.priority}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{rule.target}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Scope</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{rule.scope}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Discount</p>
                      <p className="mt-1 text-sm font-semibold text-green-600">{rule.discount}</p>
                    </div>
                  </div>
                  {rule.validUntil && (
                    <p className="mt-2 text-xs text-gray-500">
                      Valid until: {rule.validUntil}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Edit
                  </button>
                  <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Duplicate
                  </button>
                  <button className="rounded-lg p-2 text-gray-400 hover:text-red-600">
                    <iconify-icon icon="mdi:delete" className="text-xl"></iconify-icon>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

