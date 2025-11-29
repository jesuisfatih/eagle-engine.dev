'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const publicRoutes = ['/login', '/register'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for client-side hydration
  if (!mounted) {
    return <>{children}</>;
  }

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  if (isPublicRoute) {
    // Public routes (login, register) - no sidebar/header, full page
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f9' }}>
        {children}
      </div>
    );
  }

  // Authenticated routes - with sidebar/header
  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Sidebar />
        <div className="layout-page">
          <Header />
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

