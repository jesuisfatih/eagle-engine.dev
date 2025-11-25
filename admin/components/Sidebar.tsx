'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi:view-dashboard',
    href: '/dashboard',
  },
  {
    title: 'Companies',
    icon: 'mdi:office-building',
    href: '/companies',
    badge: 'New',
  },
  {
    title: 'Pricing Rules',
    icon: 'mdi:tag-multiple',
    href: '/pricing',
  },
  {
    title: 'Orders',
    icon: 'mdi:shopping',
    href: '/orders',
  },
  {
    title: 'Analytics',
    icon: 'mdi:chart-line',
    href: '/analytics',
  },
  {
    title: 'Settings',
    icon: 'mdi:cog',
    href: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-3xl">🦅</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Eagle B2B</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-xl ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      <iconify-icon icon={item.icon}></iconify-icon>
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            MS
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Merchant Shop</p>
            <p className="text-xs text-gray-500">shop.myshopify.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

