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
      
      // Get pricing - simplified
      const productsWithPricing = (Array.isArray(productsData) ? productsData : []).map(product => {
        const variant = product.variants?.[0];
        const basePrice = variant?.price || 0;
        
        // Apply 25% B2B discount (from pricing rules)
        const companyPrice = basePrice * 0.75; // 25% off
        
        return {
          ...product,
          companyPrice,
          listPrice: basePrice,
          discount: 25,
          image: product.images?.[0]?.url || 'https://via.placeholder.com/150',
          vendor: product.vendor || 'Eagle DTF',
        };
      });
      
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

  const handleAddToCart = async (productId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
    const product = displayProducts.find(p => p.id === productId);
    
    if (!product || !product.variants?.[0]) {
      throw new Error('Product or variant not found');
    }

    const variant = product.variants[0];
    
    try {
      // Step 1: Get or create cart
      let cartResponse = await fetch(`${API_URL}/api/v1/carts/active?companyId=f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d&userId=c67273cf-acea-41db-9ff5-8f6e3bbb5c38`);
      let cart = null;

      if (cartResponse.ok) {
        cart = await cartResponse.json().catch(() => null);
      }

      if (!cart || !cart.id) {
        // Create new cart
        const createResponse = await fetch(`${API_URL}/api/v1/carts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId: '6ecc682b-98ee-472d-977b-cffbbae081b8',
            companyId: 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d',
            createdByUserId: 'c67273cf-acea-41db-9ff5-8f6e3bbb5c38',
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(`Cart creation failed: ${error.message || createResponse.status}`);
        }

        cart = await createResponse.json();
        
        if (!cart || !cart.id) {
          throw new Error('Cart ID not received');
        }
      }

      // Step 2: Add item to cart
      const addItemResponse = await fetch(`${API_URL}/api/v1/carts/${cart.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: variant.id,
          shopifyVariantId: variant.shopifyVariantId.toString(),
          quantity: 1,
        }),
      });

      if (!addItemResponse.ok) {
        const error = await addItemResponse.json();
        throw new Error(`Add item failed: ${error.message || addItemResponse.status}`);
      }

      return true;
    } catch (err: any) {
      console.error('Add to cart error:', err);
      throw new Error(err.message || 'Failed to add to cart');
    }
  };

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
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




