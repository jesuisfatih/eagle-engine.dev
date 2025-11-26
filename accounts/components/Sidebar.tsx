'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { title: 'Dashboard', icon: 'ti-home', href: '/dashboard' },
  { title: 'Products', icon: 'ti-shopping-bag', href: '/products' },
  { title: 'Cart', icon: 'ti-shopping-cart', href: '/cart' },
  { title: 'Orders', icon: 'ti-package', href: '/orders' },
  { title: 'Quotes', icon: 'ti-file-invoice', href: '/quotes' },
  { title: 'Team', icon: 'ti-users', href: '/team' },
  { title: 'Profile', icon: 'ti-user-circle', href: '/profile' },
  { title: 'Wishlist', icon: 'ti-heart', href: '/wishlist' },
  { title: 'Addresses', icon: 'ti-map-pin', href: '/addresses' },
  { title: 'Notifications', icon: 'ti-bell', href: '/notifications' },
  { title: 'Support', icon: 'ti-help', href: '/support' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo">
        <Link href="/dashboard" className="app-brand-link">
          <span className="app-brand-logo demo">
            <span className="text-primary text-4xl">🦅</span>
          </span>
          <span className="app-brand-text demo menu-text fw-bold ms-2">Eagle B2B</span>
        </Link>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <li key={item.href} className={`menu-item ${isActive ? 'active' : ''}`}>
              <Link href={item.href} className="menu-link">
                <i className={`menu-icon icon-base ti ${item.icon}`}></i>
                <div>{item.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

