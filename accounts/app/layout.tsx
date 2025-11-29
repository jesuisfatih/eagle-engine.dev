import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Eagle B2B - Company Portal",
  description: "B2B Customer Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light-style layout-navbar-fixed layout-menu-fixed">
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker registered'))
                .catch(err => console.error('❌ Service Worker registration failed:', err));
            });
          }
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/fonts/fontawesome.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/fonts/tabler-icons.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/fonts/flag-icons.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/libs/node-waves/node-waves.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/css/core.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/libs/node-waves/node-waves.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/js/helpers.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/js/menu.js" defer></script>
      </head>
      <body className="bg-body">
        <LayoutWrapper>{children}</LayoutWrapper>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      </body>
    </html>
  );
}
