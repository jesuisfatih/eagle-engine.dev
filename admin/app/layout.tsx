import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Eagle B2B Admin - Dashboard',
  description: 'B2B Commerce Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light-style layout-navbar-fixed layout-menu-fixed">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/vendor/css/core.css" />
        <link rel="stylesheet" href="/vendor/fonts/tabler-icons.css" />
        <link rel="stylesheet" href="/vendor/fonts/fontawesome.css" />
        <link rel="stylesheet" href="/vendor/fonts/flag-icons.css" />
        <link rel="stylesheet" href="/vendor/libs/node-waves/node-waves.css" />
        <link rel="stylesheet" href="/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="/vendor/libs/node-waves/node-waves.js" defer></script>
        <script src="/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" defer></script>
        <script src="/vendor/js/helpers.js" defer></script>
        <script src="/vendor/js/menu.js" defer></script>
      </head>
      <body className="bg-body">
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
      </body>
    </html>
  );
}
