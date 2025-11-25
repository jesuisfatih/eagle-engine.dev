'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'ti-smart-home',
    href: '/dashboard',
  },
  {
    title: 'Companies',
    icon: 'ti-building',
    href: '/companies',
  },
  {
    title: 'Users',
    icon: 'ti-users',
    href: '/users',
  },
  {
    title: 'Pricing Rules',
    icon: 'ti-discount',
    href: '/pricing',
  },
  {
    title: 'Orders',
    icon: 'ti-shopping-cart',
    href: '/orders',
  },
  {
    title: 'Abandoned Carts',
    icon: 'ti-shopping-cart-off',
    href: '/abandoned-carts',
  },
  {
    title: 'Analytics',
    icon: 'ti-chart-line',
    href: '/analytics',
  },
  {
    title: 'Quotes',
    icon: 'ti-file-invoice',
    href: '/quotes',
  },
  {
    title: 'Settings',
    icon: 'ti-settings',
    href: '/settings',
  },
  {
    title: 'Sync Logs',
    icon: 'ti-file-text',
    href: '/settings/sync-logs',
  },
  {
    title: 'Reports',
    icon: 'ti-file-analytics',
    href: '/reports',
  },
  {
    title: 'Webhooks',
    icon: 'ti-webhook',
    href: '/webhooks',
  },
  {
    title: 'Activity',
    icon: 'ti-activity',
    href: '/activity',
  },
  {
    title: 'Customers',
    icon: 'ti-user-check',
    href: '/customers',
  },
  {
    title: 'Catalog',
    icon: 'ti-package',
    href: '/catalog',
  },
  {
    title: 'Integrations',
    icon: 'ti-plug',
    href: '/integrations',
  },
  {
    title: 'Email Templates',
    icon: 'ti-mail',
    href: '/email-templates',
  },
  {
    title: 'Permissions',
    icon: 'ti-shield-lock',
    href: '/permissions',
  },
  {
    title: 'API Keys',
    icon: 'ti-key',
    href: '/api-keys',
  },
  {
    title: 'Support',
    icon: 'ti-help',
    href: '/support',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      {/* Logo */}
      <div className="app-brand demo">
        <Link href="/dashboard" className="app-brand-link">
          <span className="app-brand-logo demo">
            <span className="text-primary text-4xl">🦅</span>
          </span>
          <span className="app-brand-text demo menu-text fw-bold ms-2">Eagle B2B</span>
        </Link>
        <a href="javascript:void(0);" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="icon-base ti tabler-x"></i>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      {/* Navigation */}
      <ul className="menu-inner py-1 ps ps--active-y">
        {menuItems.map((item) => {
          // Exact match or child route match (but not parent-child conflict)
          const isExactMatch = pathname === item.href;
          const isChildRoute = pathname?.startsWith(item.href + '/');
          const isActive = isExactMatch || (isChildRoute && !menuItems.some(mi => pathname === mi.href));
          
          return (
            <li key={item.href} className={`menu-item ${isActive ? 'active' : ''}`}>
              <Link href={item.href} className="menu-link">
                <i className={`menu-icon tf-icons ti ${item.icon}`}></i>
                <div>{item.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}




