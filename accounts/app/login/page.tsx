'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountsApi } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await accountsApi.login(email, password);
      accountsApi.setToken(result.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="d-inline-block mb-3" style={{fontSize: '48px'}}>🦅</span>
            <h3 className="fw-bold mb-1">Eagle B2B</h3>
            <p className="text-muted">Company Portal Login</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Don't have an account? Contact your administrator
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}




