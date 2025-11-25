'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple check - production'da NextAuth kullanılacak
    if (username === 'admin' && password === 'eagle2025') {
      localStorage.setItem('eagle_admin_token', 'admin-token');
      router.push('/dashboard');
    } else {
      alert('Invalid credentials. Use: admin / eagle2025');
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="d-inline-block mb-3" style={{fontSize: '48px'}}>🦅</span>
            <h3 className="fw-bold mb-1">Eagle B2B Admin</h3>
            <p className="text-muted">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">Default: admin / eagle2025</small>
          </div>
        </div>
      </div>
    </div>
  );
}




