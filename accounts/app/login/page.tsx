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
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                {/* Logo & Brand */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-3" style={{ width: 64, height: 64 }}>
                    <span className="text-white fs-2">🦅</span>
                  </div>
                  <h3 className="fw-bold mb-1">Welcome Back!</h3>
                  <p className="text-muted">Sign in to your B2B account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="ti ti-alert-circle me-2"></i>
                    <div>{error}</div>
                    <button type="button" className="btn-close ms-auto" onClick={() => setError('')}></button>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="ti ti-mail me-1"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label fw-semibold mb-0">
                        <i className="ti ti-lock me-1"></i>Password
                      </label>
                      <Link href="/forgot-password" className="small text-primary text-decoration-none">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="input-group mt-2">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="remember-me" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="remember-me">
                        Remember me on this device
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-100 mb-3"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-login me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small">New to Eagle B2B?</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Register Links */}
                <div className="d-grid gap-2">
                  <Link href="/register" className="btn btn-outline-primary">
                    <i className="ti ti-user-plus me-2"></i>
                    Create an Account
                  </Link>
                  <Link href="/request-invitation" className="btn btn-outline-secondary">
                    <i className="ti ti-mail-forward me-2"></i>
                    Request B2B Invitation
                  </Link>
                </div>

                {/* B2B Benefits */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted small text-center mb-3">B2B Account Benefits</p>
                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <i className="ti ti-discount-2 text-success fs-4"></i>
                      <p className="small text-muted mb-0 mt-1">Bulk Discounts</p>
                    </div>
                    <div className="col-4">
                      <i className="ti ti-credit-card text-info fs-4"></i>
                      <p className="small text-muted mb-0 mt-1">Net Terms</p>
                    </div>
                    <div className="col-4">
                      <i className="ti ti-users text-primary fs-4"></i>
                      <p className="small text-muted mb-0 mt-1">Team Access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-white-50 mt-4 small">
              © 2025 Eagle DTF Supply. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
