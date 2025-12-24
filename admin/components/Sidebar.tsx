'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * Menu Item Interface
 */
interface MenuItem {
  title: string;
  icon: string;
  href: string;
}

/**
 * Menu Group Interface
 */
interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/**
 * Organized menu structure with groups
 */
const menuGroups: MenuGroup[] = [
  {
    label: '',
    items: [
      { title: 'Dashboard', icon: 'ti-smart-home', href: '/dashboard' },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { title: 'Companies', icon: 'ti-building', href: '/companies' },
      { title: 'Users', icon: 'ti-users', href: '/users' },
      { title: 'Orders', icon: 'ti-shopping-cart', href: '/orders' },
      { title: 'Quotes', icon: 'ti-file-invoice', href: '/quotes' },
      { title: 'Abandoned Carts', icon: 'ti-shopping-cart-off', href: '/abandoned-carts' },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { title: 'Products', icon: 'ti-package', href: '/catalog' },
      { title: 'Pricing Rules', icon: 'ti-discount', href: '/pricing' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { title: 'Analytics', icon: 'ti-chart-line', href: '/analytics' },
      { title: 'Reports', icon: 'ti-file-analytics', href: '/reports' },
      { title: 'Activity', icon: 'ti-activity', href: '/activity' },
      { title: 'Sessions', icon: 'ti-device-desktop', href: '/sessions' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { title: 'Settings', icon: 'ti-settings', href: '/settings' },
      { title: 'Webhooks', icon: 'ti-webhook', href: '/webhooks' },
      { title: 'Integrations', icon: 'ti-plug', href: '/integrations' },
      { title: 'API Keys', icon: 'ti-key', href: '/api-keys' },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { title: 'Support Tickets', icon: 'ti-help', href: '/support' },
      { title: 'Customers', icon: 'ti-user-check', href: '/customers' },
    ],
  },
];

/**
 * Check if a menu item is active
 */
function isMenuItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  // Child route match (e.g., /companies/123 matches /companies)
  if (pathname.startsWith(href + '/')) return true;
  return false;
}

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
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Group Label */}
            {group.label && (
              <li className="menu-header small text-uppercase">
                <span className="menu-header-text">{group.label}</span>
              </li>
            )}
            
            {/* Group Items */}
            {group.items.map((item) => {
              const isActive = isMenuItemActive(pathname, item.href);
              
              return (
                <li key={item.href} className={`menu-item ${isActive ? 'active' : ''}`}>
                  <Link href={item.href} className="menu-link">
                    <i className={`menu-icon tf-icons ti ${item.icon}`}></i>
                    <div>{item.title}</div>
                  </Link>
                </li>
              );
            })}
          </div>
        ))}
      </ul>
    </aside>
  );
}




