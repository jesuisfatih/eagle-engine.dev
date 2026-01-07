'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ToastContainer } from '@/components/ui';

const PUBLIC_PATHS = ['/login'];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Login page - no sidebar/header
  if (isPublicPath) {
    return (
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    );
  }

  // Authenticated pages - with sidebar/header
  return (
    <AuthProvider>
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
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      <ToastContainer />
    </AuthProvider>
  );
}
