'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'tabler-smart-home',
    href: '/dashboard',
  },
  {
    title: 'Companies',
    icon: 'tabler-building',
    href: '/companies',
  },
  {
    title: 'Users',
    icon: 'tabler-users',
    href: '/users',
  },
  {
    title: 'Pricing Rules',
    icon: 'tabler-discount',
    href: '/pricing',
  },
  {
    title: 'Orders',
    icon: 'tabler-shopping-cart',
    href: '/orders',
  },
  {
    title: 'Analytics',
    icon: 'tabler-chart-line',
    href: '/analytics',
  },
  {
    title: 'Quotes',
    icon: 'tabler-file-invoice',
    href: '/quotes',
  },
  {
    title: 'Settings',
    icon: 'tabler-settings',
    href: '/settings',
  },
  {
    title: 'Sync Logs',
    icon: 'tabler-file-text',
    href: '/settings/sync-logs',
  },
  {
    title: 'Reports',
    icon: 'tabler-file-analytics',
    href: '/reports',
  },
  {
    title: 'Webhooks',
    icon: 'tabler-webhook',
    href: '/webhooks',
  },
  {
    title: 'Activity',
    icon: 'tabler-activity',
    href: '/activity',
  },
  {
    title: 'Customers',
    icon: 'tabler-user-check',
    href: '/customers',
  },
  {
    title: 'Catalog',
    icon: 'tabler-package',
    href: '/catalog',
  },
  {
    title: 'Integrations',
    icon: 'tabler-plug',
    href: '/integrations',
  },
  {
    title: 'Email Templates',
    icon: 'tabler-mail',
    href: '/email-templates',
  },
  {
    title: 'Permissions',
    icon: 'tabler-shield-lock',
    href: '/permissions',
  },
  {
    title: 'API Keys',
    icon: 'tabler-key',
    href: '/api-keys',
  },
  {
    title: 'Support',
    icon: 'tabler-help',
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
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <li key={item.href} className={`menu-item ${isActive ? 'active' : ''}`}>
              <Link href={item.href} className="menu-link">
                <i className={`menu-icon tf-icons icon-base ti ${item.icon}`}></i>
                <div>{item.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}




