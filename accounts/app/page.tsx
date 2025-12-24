'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('eagle_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8 text-center text-white">
            {/* Logo */}
            <div className="mb-4">
              <span className="fs-1">🦅</span>
            </div>
            
            {/* Hero Title */}
            <h1 className="display-4 fw-bold mb-3">
              Eagle B2B Portal
            </h1>
            <p className="lead mb-5 opacity-75">
              Your complete B2B wholesale platform for DTF supplies and custom printing solutions.
            </p>

            {/* CTA Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <Link href="/login" className="btn btn-light btn-lg px-5">
                <i className="ti ti-login me-2"></i>
                Sign In
              </Link>
              <Link href="/request-invitation" className="btn btn-outline-light btn-lg px-5">
                <i className="ti ti-mail-forward me-2"></i>
                Request Access
              </Link>
            </div>

            {/* Features */}
            <div className="row g-4 mt-5">
              <div className="col-md-4">
                <div className="bg-white bg-opacity-10 rounded-3 p-4">
                  <i className="ti ti-discount-2 fs-1 mb-3"></i>
                  <h5 className="fw-bold">Wholesale Pricing</h5>
                  <p className="small opacity-75 mb-0">
                    Exclusive B2B discounts up to 40% off retail prices.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-white bg-opacity-10 rounded-3 p-4">
                  <i className="ti ti-credit-card fs-1 mb-3"></i>
                  <h5 className="fw-bold">Net 30 Terms</h5>
                  <p className="small opacity-75 mb-0">
                    Flexible payment options for qualified businesses.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-white bg-opacity-10 rounded-3 p-4">
                  <i className="ti ti-users fs-1 mb-3"></i>
                  <h5 className="fw-bold">Team Management</h5>
                  <p className="small opacity-75 mb-0">
                    Add team members with customizable permissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 pt-4 border-top border-white border-opacity-25">
              <div className="row justify-content-center g-4">
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-2 opacity-75">
                    <i className="ti ti-lock fs-4"></i>
                    <span className="small">Secure Checkout</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-2 opacity-75">
                    <i className="ti ti-truck fs-4"></i>
                    <span className="small">Fast Shipping</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-2 opacity-75">
                    <i className="ti ti-headset fs-4"></i>
                    <span className="small">Priority Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white-50 mt-5 small">
          © 2025 Eagle DTF Supply. All rights reserved.
        </p>
      </div>
    </div>
  );
}
