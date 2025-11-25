'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies] = useState([
    {
      id: '1',
      name: 'TechCorp Industries',
      email: 'contact@techcorp.com',
      status: 'active',
      users: 12,
      orders: 145,
      totalSpent: 45600,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Global Supplies Ltd',
      email: 'info@globalsupplies.com',
      status: 'active',
      users: 8,
      orders: 128,
      totalSpent: 38200,
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      name: 'Mega Wholesale Co',
      email: 'orders@megawholesale.com',
      status: 'pending',
      users: 5,
      orders: 0,
      totalSpent: 0,
      createdAt: '2024-11-22',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your B2B company accounts</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <span className="flex items-center space-x-2">
            <iconify-icon icon="mdi:plus"></iconify-icon>
            <span>Invite Company</span>
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <iconify-icon icon="mdi:office-building" className="text-2xl text-blue-600"></iconify-icon>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <iconify-icon icon="mdi:account-check" className="text-2xl text-green-600"></iconify-icon>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invites</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="rounded-full bg-orange-50 p-3">
              <iconify-icon icon="mdi:email-outline" className="text-2xl text-orange-600"></iconify-icon>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <iconify-icon icon="mdi:magnify"></iconify-icon>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Orders</th>
                <th className="px-6 py-3">Total Spent</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/companies/${company.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {company.name}
                        </Link>
                        <p className="text-sm text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        company.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : company.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{company.users}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{company.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${company.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{company.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <iconify-icon icon="mdi:pencil" className="text-lg"></iconify-icon>
                      </button>
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <iconify-icon icon="mdi:eye" className="text-lg"></iconify-icon>
                      </button>
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                        <iconify-icon icon="mdi:delete" className="text-lg"></iconify-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
              <span className="font-medium">24</span> results
            </p>
            <div className="flex items-center space-x-2">
              <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white">1</button>
              <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



