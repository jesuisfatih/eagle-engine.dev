'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('eagle_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('eagle_token', data.token);
        localStorage.setItem('eagle_userId', data.user.id);
        localStorage.setItem('eagle_companyId', data.user.companyId);
        localStorage.setItem('eagle_userEmail', data.user.email);
        localStorage.setItem('eagle_userName', `${data.user.firstName} ${data.user.lastName}`);
        localStorage.setItem('eagle_loginTime', Date.now().toString());
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authentication-wrapper authentication-cover authentication-bg">
      <div className="authentication-inner row">
        <div className="d-none d-lg-flex col-lg-7 p-0">
          <div className="auth-cover-bg auth-cover-bg-color d-flex justify-content-center align-items-center">
            <img
              src="/img/illustrations/auth-login-illustration-light.png"
              alt="auth-login-cover"
              className="img-fluid my-5 auth-illustration"
            />
          </div>
        </div>

        <div className="d-flex col-12 col-lg-5 align-items-center p-sm-5 p-4">
          <div className="w-px-400 mx-auto">
            <div className="app-brand mb-4">
              <span className="text-primary text-4xl">🦅</span>
              <span className="app-brand-text demo fw-bold ms-2">Eagle B2B</span>
            </div>
            <h4 className="mb-1 fw-bold">Welcome! 👋</h4>
            <p className="mb-4">Please sign-in to your account and start the adventure</p>

            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                <div className="alert-message">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              <div className="mb-3 form-password-toggle">
                <div className="d-flex justify-content-between">
                  <label className="form-label">Password</label>
                  <a href="/forgot-password">
                    <small>Forgot Password?</small>
                  </a>
                </div>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember-me" />
                  <label className="form-check-label" htmlFor="remember-me">
                    Remember Me
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary d-grid w-100 mb-3"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="text-center">
              <span>New on our platform? </span>
              <a href="/register">
                <span>Create an account</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
