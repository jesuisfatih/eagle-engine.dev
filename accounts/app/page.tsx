'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('eagle_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: 800 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 48 }}>🦅</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 42, fontWeight: 700, textAlign: 'center', color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Eagle B2B Portal
        </h1>
        <p style={{ fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px', lineHeight: 1.6 }}>
          Your complete B2B wholesale platform for DTF supplies and custom printing solutions.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 56 }}>
          <Link href="/login" className="btn-apple btn-apple-primary" style={{ height: 48, padding: '0 36px', fontSize: 16, textDecoration: 'none', background: '#fff', color: '#1a1a2e' }}>
            <i className="ti ti-login" style={{ marginRight: 8 }}></i>
            Sign In
          </Link>
          <Link href="/request-invitation" className="btn-apple" style={{ height: 48, padding: '0 36px', fontSize: 16, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff' }}>
            <i className="ti ti-mail-forward" style={{ marginRight: 8 }}></i>
            Request Access
          </Link>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: 'ti-discount-2', title: 'Wholesale Pricing', desc: 'Exclusive B2B discounts up to 40% off retail prices.' },
            { icon: 'ti-credit-card', title: 'Net 30 Terms', desc: 'Flexible payment options for qualified businesses.' },
            { icon: 'ti-users', title: 'Team Management', desc: 'Add team members with customizable permissions.' },
          ].map((f) => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: 36, color: '#fff', marginBottom: 16, display: 'block' }}></i>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { icon: 'ti-lock', text: 'Secure Checkout' },
            { icon: 'ti-truck', text: 'Fast Shipping' },
            { icon: 'ti-headset', text: 'Priority Support' },
          ].map((b) => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)' }}>
              <i className={`ti ${b.icon}`} style={{ fontSize: 18 }}></i>
              <span style={{ fontSize: 14 }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 40, fontSize: 13 }}>
          © 2025 Eagle DTF Supply. All rights reserved.
        </p>
      </div>
    </div>
  );
}
