'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const publicRoutes = ['/login', '/register', '/request-invitation'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [pathname, mounted]);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('eagle_token');
    const userId = localStorage.getItem('eagle_userId');
    const companyId = localStorage.getItem('eagle_companyId');
    
    const authenticated = !!(token && userId && companyId);
    setIsAuthenticated(authenticated);
    
    // If not authenticated and not on public route, redirect to login
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    if (!authenticated && !isPublicRoute && mounted) {
      router.push('/login');
    }
  };

  // Wait for client-side hydration
  if (!mounted) {
    return <>{children}</>;
  }

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  if (isPublicRoute) {
    // Public routes (login, register, request-invitation) - no sidebar/header, full page
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f9' }}>
        {children}
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (isAuthenticated === false) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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

