'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const [productsData, pricingData] = await Promise.all([
        fetch(`${API_URL}/api/v1/catalog/products?limit=100`).then(r => r.json()),
        fetch(`${API_URL}/api/v1/pricing/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantIds: [], companyId: 'test' })
        }).then(r => r.json()).catch(() => null)
      ]);
      
      // Merge pricing data
      const productsWithPricing = Array.isArray(productsData) ? productsData.map(p => ({
        ...p,
        companyPrice: p.variants?.[0]?.price || p.price,
        listPrice: p.variants?.[0]?.price || p.price,
        discount: 0
      })) : [];
      
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
          <input
            type="text"
            placeholder="Search products..."
            className="form-control"
            style={{maxWidth: '300px'}}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
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




