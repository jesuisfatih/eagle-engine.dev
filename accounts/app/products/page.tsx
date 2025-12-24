'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import ProductCard from './components/ProductCard';
import type { Product, ProductVariant, B2BPricing } from '@/types';

// Extended product with pricing info
interface ProductWithPricing extends Product {
  companyPrice: number;
  listPrice: number;
  discount: number;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsResponse = await accountsFetch('/api/v1/catalog/products?limit=100');
      const productsData = await productsResponse.json();
      
      // Get variant IDs for pricing calculation
      const allVariantIds = (Array.isArray(productsData) ? productsData as Product[] : [])
        .flatMap(p => p.variants?.map((v: ProductVariant) => v.shopifyVariantId?.toString()) || [])
        .filter(Boolean);
      
      // Get actual B2B pricing from API
      let pricingMap: Record<string, B2BPricing> = {};
      if (allVariantIds.length > 0) {
        try {
          const pricingResponse = await accountsFetch('/api/v1/pricing/calculate', {
            method: 'POST',
            body: JSON.stringify({ variantIds: allVariantIds }),
          });
          if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();
            pricingMap = (pricingData.prices || []).reduce((acc: Record<string, B2BPricing>, p: B2BPricing) => {
              acc[p.variantId] = p;
              return acc;
            }, {});
          }
        } catch (e) {
          console.error('Pricing fetch error:', e);
        }
      }
      
      const productsWithPricing: ProductWithPricing[] = (Array.isArray(productsData) ? productsData : []).map((product: Product) => {
        const variant = product.variants?.[0];
        const basePrice = parseFloat(String(variant?.price)) || 0;
        const pricing = pricingMap[variant?.shopifyVariantId?.toString()] || {} as B2BPricing;
        
        const companyPrice = pricing.discountedPrice || basePrice;
        const discount = pricing.discountPercentage || 0;
        
        return {
          ...product,
          companyPrice,
          listPrice: basePrice,
          discount,
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

  const displayProducts = products;

  const handleAddToCart = async (productId: string) => {
    const product = displayProducts.find(p => p.id === productId);
    
    if (!product || !product.variants?.[0]) {
      throw new Error('Product or variant not found');
    }

    const variant = product.variants[0];
    const companyId = localStorage.getItem('eagle_companyId') || '';
    const userId = localStorage.getItem('eagle_userId') || '';
    const merchantId = localStorage.getItem('eagle_merchantId') || '';
    
    if (!merchantId) {
      throw new Error('Merchant not found. Please login again.');
    }
    
    try {
      // Step 1: Get or create cart
      const cartResponse = await accountsFetch('/api/v1/carts/active');
      let cart = null;

      if (cartResponse.ok) {
        cart = await cartResponse.json().catch(() => null);
      }

      if (!cart || !cart.id) {
        // Create new cart
        const cartData = {
          merchantId,
          companyId,
          createdByUserId: userId
        };

        const createResponse = await accountsFetch('/api/v1/carts', {
          method: 'POST',
          body: JSON.stringify(cartData),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Cart create error:', errorText);
          throw new Error(`Cart creation failed: ${createResponse.status}`);
        }

        cart = await createResponse.json();
        
        if (!cart || !cart.id) {
          throw new Error('Cart ID not received');
        }
      }

      // Step 2: Add item to cart
      const addItemResponse = await accountsFetch(`/api/v1/carts/${cart.id}/items`, {
        method: 'POST',
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
    } catch (err) {
      console.error('Add to cart error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add to cart');
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




