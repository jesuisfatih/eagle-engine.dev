'use client';

import { useState, useEffect } from 'react';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/catalog/products?limit=100`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setProducts([]);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Product Catalog</h4>
          <p className="mb-0 text-muted">Manage synced products from Shopify</p>
        </div>
        <button
          onClick={async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
            await fetch(`${API_URL}/api/v1/sync/products`, { method: 'POST' });
            alert('✅ Products sync started!');
            setTimeout(loadProducts, 3000);
          }}
          className="btn btn-primary"
        >
          <i className="ti ti-refresh me-1"></i>
          Sync Products
        </button>
      </div>

      <div className="row g-4">
        {products.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="ti ti-package ti-3x text-muted mb-3"></i>
                <h5>No products synced</h5>
                <p className="text-muted">Click "Sync Products" to import from Shopify</p>
              </div>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">{product.title}</h6>
                  <p className="text-muted small">{product.vendor}</p>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Variants: {product.variants?.length || 0}</span>
                    <span className="badge bg-label-success">{product.status}</span>
                  </div>
                  <div className="mb-3">
                    <span className="fw-bold text-primary">${product.variants?.[0]?.price || 0}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        window.location.href = `/pricing?productId=${product.shopifyProductId}`;
                      }}
                      className="btn btn-sm btn-primary flex-fill"
                    >
                      <i className="ti ti-tag me-1"></i>
                      Set Pricing
                    </button>
                    <button
                      onClick={() => {
                        alert(`Product: ${product.title}\nShopify ID: ${product.shopifyProductId}\nVariants: ${product.variants?.length}`);
                      }}
                      className="btn btn-sm btn-label-secondary"
                    >
                      <i className="ti ti-info-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

