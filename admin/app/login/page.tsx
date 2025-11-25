'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInstall = () => {
    if (!shopDomain) return;
    
    setLoading(true);
    const domain = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`;
    window.location.href = `${process.env.NEXT_PUBLIC_SHOPIFY_INSTALL_URL}?shop=${domain}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl">
            🦅
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Eagle B2B</h1>
          <p className="mt-2 text-gray-600">Admin Panel</p>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700">
            Your Shopify Store Domain
          </label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleInstall()}
            />
            <span className="text-gray-500">.myshopify.com</span>
          </div>
        </div>

        <button
          onClick={handleInstall}
          disabled={loading || !shopDomain}
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Installing...' : 'Install Eagle B2B'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          By installing, you agree to Eagle B2B's{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}

