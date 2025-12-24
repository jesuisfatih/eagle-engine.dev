'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
const DEFAULT_SHOP = 'eagledtfsupply.myshopify.com';

export default function LoginPage() {
  const [shopDomain, setShopDomain] = useState(DEFAULT_SHOP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback with token
  useEffect(() => {
    const token = searchParams.get('token');
    const shop = searchParams.get('shop');
    const oauthError = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (oauthError) {
      setError(`OAuth failed: ${errorMessage || oauthError}`);
      return;
    }

    if (token) {
      // Store the real JWT token
      localStorage.setItem('eagle_admin_token', token);
      if (shop) {
        localStorage.setItem('eagle_admin_shop', shop);
      }
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const handleShopifyLogin = () => {
    setLoading(true);
    setError('');
    
    // Redirect to Shopify OAuth
    const shop = shopDomain.includes('.myshopify.com') 
      ? shopDomain 
      : `${shopDomain}.myshopify.com`;
    
    window.location.href = `${API_URL}/api/v1/auth/shopify/install?shop=${encodeURIComponent(shop)}`;
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="d-inline-block mb-3" style={{fontSize: '48px'}}>🦅</span>
            <h3 className="fw-bold mb-1">Eagle B2B Admin</h3>
            <p className="text-muted">Sign in with your Shopify store</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Shopify Store Domain</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="your-store.myshopify.com"
                required
              />
            </div>
            <small className="text-muted">Enter your Shopify store domain</small>
          </div>

          <button
            type="button"
            onClick={handleShopifyLogin}
            disabled={loading || !shopDomain}
            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
            style={{backgroundColor: '#95BF47', borderColor: '#95BF47'}}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Connecting to Shopify...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M15.337 3.415c-.152-.071-.319-.109-.492-.109H9.155c-.173 0-.34.038-.492.109-.152.071-.279.171-.374.291L5.5 7.415v13c0 .276.224.5.5.5h12c.276 0 .5-.224.5-.5v-13l-2.789-3.709c-.095-.12-.222-.22-.374-.291zM12 4.915c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z"/>
                </svg>
                Login with Shopify
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <small className="text-muted">
              You&apos;ll be redirected to Shopify to authorize this app
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}




