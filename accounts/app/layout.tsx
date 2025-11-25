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
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/css/core.css" />
        <link rel="stylesheet" href="https://app.eagledtfsupply.com/vendor/fonts/iconify-icons.css" />
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
