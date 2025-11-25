import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/css/core.css" />
        <style>{`
          .menu-icon.ti { 
            font-size: 1.25rem !important;
            width: auto !important;
            height: auto !important;
            line-height: 1 !important;
          }
        `}</style>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/js/helpers.js" defer></script>
        <script src="https://app.eagledtfsupply.com/vendor/js/menu.js" defer></script>
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
