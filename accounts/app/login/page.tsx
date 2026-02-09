'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicFetch } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('eagle_token');
    if (token) {
      router.push('/dashboard');
    }
    
    // Check for remembered email
    const savedEmail = localStorage.getItem('eagle_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await publicFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('eagle_token', data.accessToken || data.token);
        localStorage.setItem('eagle_userId', data.user.id);
        localStorage.setItem('eagle_companyId', data.user.companyId);
        localStorage.setItem('eagle_merchantId', data.user.merchantId || '');
        localStorage.setItem('eagle_userEmail', data.user.email);
        localStorage.setItem('eagle_userName', `${data.user.firstName} ${data.user.lastName}`);
        localStorage.setItem('eagle_userRole', data.user.role || 'member');
        localStorage.setItem('eagle_loginTime', Date.now().toString());
        
        // Remember email if checked
        if (rememberMe) {
          localStorage.setItem('eagle_remembered_email', email);
        } else {
          localStorage.removeItem('eagle_remembered_email');
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: 440

 }}>
          {/* Logo & Brand */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 28, color: '#fff' }}>🦅</span>
            </div>
            <h2 style={{ fontWeight: 700, fontSize: 22, margin: '0 0 4px' }}>Welcome Back!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Sign in to your B2B account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-alert-circle"></i>
              <span style={{ flex: 1 }}>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <i className="ti ti-x"></i>
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <i className="ti ti-mail" style={{ marginRight: 4 }}></i>Email Address
              </label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <i className="ti ti-lock" style={{ marginRight: 4 }}></i>Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-tertiary)' }}
                >
                  <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember me on this device
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-apple btn-apple-primary" style={{ width: '100%', height: 44, fontSize: 15, marginTop: 8 }}>
              {loading ? (
                <><span className="spinner-apple" style={{ width: 18, height: 18, marginRight: 8 }} />Signing in...</>
              ) : (
                <><i className="ti ti-login" style={{ marginRight: 8 }}></i>Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>New to Eagle B2B?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/register" className="btn-apple btn-apple-secondary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center', height: 42 }}>
              <i className="ti ti-user-plus" style={{ marginRight: 8 }}></i>
              Create an Account
            </Link>
            <Link href="/request-invitation" className="btn-apple" style={{ width: '100%', textDecoration: 'none', textAlign: 'center', height: 42, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <i className="ti ti-mail-forward" style={{ marginRight: 8 }}></i>
              Request B2B Invitation
            </Link>
          </div>

          {/* B2B Benefits */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', margin: '0 0 16px' }}>B2B Account Benefits</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
              <div>
                <i className="ti ti-discount-2" style={{ fontSize: 22, color: 'var(--green)' }}></i>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0 0' }}>Bulk Discounts</p>
              </div>
              <div>
                <i className="ti ti-credit-card" style={{ fontSize: 22, color: 'var(--accent)' }}></i>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0 0' }}>Net Terms</p>
              </div>
              <div>
                <i className="ti ti-users" style={{ fontSize: 22, color: 'var(--purple)' }}></i>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0 0' }}>Team Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: 24, fontSize: 13 }}>
          © 2025 Eagle DTF Supply. All rights reserved.
        </p>
      </div>
    </div>
  );
}
