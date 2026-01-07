import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

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
        <link rel="stylesheet" href="/vendor/fonts/fontawesome.css" />
        <link rel="stylesheet" href="/vendor/fonts/flag-icons.css" />
        <link rel="stylesheet" href="/vendor/libs/node-waves/node-waves.css" />
        <link rel="stylesheet" href="/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <link rel="stylesheet" href="/vendor/css/core.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="/vendor/libs/node-waves/node-waves.js" defer></script>
        <script src="/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" defer></script>
        <script src="/vendor/js/helpers.js" defer></script>
        <script src="/vendor/js/menu.js" defer></script>
      </head>
      <body className="bg-body">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
