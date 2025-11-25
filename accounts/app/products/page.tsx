'use client';

import { useState, useEffect } from 'react';
import { accountsApi } from '@/lib/api-client';
import ProductCard from './components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const productsData = await fetch(`${API_URL}/api/v1/catalog/products?limit=100`).then(r => r.json());
      
      // Get pricing for each product variant
      const productsWithPricing = [];
      for (const product of (Array.isArray(productsData) ? productsData : [])) {
        const variant = product.variants?.[0];
        if (!variant) continue;
        
        try {
          const pricingResp = await fetch(`${API_URL}/api/v1/pricing/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variantIds: [variant.shopifyVariantId],
              companyId: 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d',
              quantities: { [variant.shopifyVariantId]: 1 }
            })
          });
          const pricing = await pricingResp.json();
          const priceData = pricing[0];
          
          productsWithPricing.push({
            ...product,
            companyPrice: priceData?.companyPrice || variant.price,
            listPrice: priceData?.listPrice || variant.price,
            discount: priceData?.discountPercentage || 0,
            image: product.images?.[0]?.url || 'https://via.placeholder.com/150',
            vendor: product.vendor || 'Eagle DTF',
          });
        } catch (err) {
          productsWithPricing.push({
            ...product,
            companyPrice: variant.price,
            listPrice: variant.price,
            discount: 0,
            image: 'https://via.placeholder.com/150',
            vendor: product.vendor || 'Eagle DTF',
          });
        }
      }
      
      setProducts(productsWithPricing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleProducts = [
    {
      id: '1',
      title: 'Premium Laptop Stand',
      vendor: 'TechGear',
      listPrice: 49.99,
      companyPrice: 37.49,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
    {
      id: '2',
      title: 'Wireless Keyboard',
      vendor: 'KeyMaster',
      listPrice: 79.99,
      companyPrice: 59.99,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
    {
      id: '3',
      title: 'Ergonomic Mouse',
      vendor: 'ComfortTech',
      listPrice: 39.99,
      companyPrice: 29.99,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      inStock: true,
    },
  ];

  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <div>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Product Catalog</h4>
            <p className="mb-0 text-muted">Browse with exclusive B2B pricing</p>
          </div>
          <div className="d-flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="form-control"
              style={{maxWidth: '300px'}}
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                if (query) {
                  const filtered = products.filter(p => 
                    p.title?.toLowerCase().includes(query) ||
                    p.vendor?.toLowerCase().includes(query)
                  );
                  setProducts(filtered);
                } else {
                  loadProducts();
                }
              }}
            />
            <select className="form-select" style={{maxWidth: '150px'}}>
              <option value="">All Categories</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2 text-muted">Loading products with B2B pricing...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="ti ti-package-off ti-3x text-muted mb-3"></i>
              <h5>No products available</h5>
              <p className="text-muted">Products will appear here after sync</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {displayProducts.map((product) => (
              <div key={product.id} className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{product.title}</h5>
                    <p className="card-text small text-muted">{product.vendor}</p>
                    <div className="mt-3">
                      <h4 className="text-primary mb-0">${product.companyPrice || product.listPrice}</h4>
                      {product.companyPrice && (
                        <div>
                          <span className="text-muted small text-decoration-line-through">${product.listPrice}</span>
                          <span className="badge bg-label-success ms-2">-{product.discount}%</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const cart = await accountsApi.getActiveCart().catch(() => null);
                          if (!cart) {
                            // Create cart first
                            alert('Creating cart...');
                            return;
                          }
                          await accountsApi.addToCart(
                            product.id,
                            product.shopifyProductId?.toString() || product.id,
                            1
                          );
                          alert('✅ Added to cart!');
                        } catch (err: any) {
                          alert('❌ Error: ' + err.message);
                        }
                      }}
                      className="btn btn-primary w-100 mt-3"
                    >
                      <i className="ti ti-shopping-cart-plus me-1"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




