'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth-service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initAuth();
  }, [searchParams, router]);

  const initAuth = async () => {
    // Auto-login from Shopify callback
    const token = searchParams.get('token');
    const auto = searchParams.get('auto');
    
    if (token && auto === 'true') {
      await authService.setToken(token);
      router.push('/dashboard');
      return;
    }

    // Try to recover session
    const recovered = await authService.recoverSession();
    if (recovered) {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store Eagle token (multi-layer)
        await authService.setToken(data.token);
        await authService.setUserData(data.user);
        authService.startTokenRefresh();
        
        // Redirect to Shopify for SSO
        if (data.shopifySsoUrl) {
          window.location.href = data.shopifySsoUrl;
        } else {
          router.push('/dashboard');
        }
      } else {
        const modal = document.createElement('div');
        modal.className = 'modal fade show d-block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">❌ Login Failed</h5>
                <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
              </div>
              <div class="modal-body">
                <p>Invalid email or password.</p>
                <p class="small text-muted">Please check your credentials and try again.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">Try Again</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
    } catch (err) {
      console.error(err);
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
            <h4 className="mb-1 fw-bold">Welcome!</h4>
            <p className="mb-4">Please sign-in to your account</p>

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
                />
              </div>
              <div className="mb-3 form-password-toggle">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary d-grid w-100 mb-3"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-center">
              <span>New user? </span>
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
