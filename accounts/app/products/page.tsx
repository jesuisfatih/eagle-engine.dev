'use client';

import { useState, useEffect, useMemo } from 'react';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import ProductCard from './components/ProductCard';
import type { Product, ProductVariant, B2BPricing } from '@/types';

// Extended product with pricing info
interface ProductWithPricing extends Product {
  companyPrice: number;
  listPrice: number;
  discount: number;
  image: string;
  inStock?: boolean;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'discount' | 'newest';
type ViewMode = 'grid' | 'list';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricingError, setPricingError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setPricingError(false);
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
          } else {
            setPricingError(true);
          }
        } catch (e) {
          console.error('Pricing fetch error:', e);
          setPricingError(true);
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
          inStock: variant?.inventoryQuantity === undefined || variant.inventoryQuantity > 0,
        };
      });
      
      setProducts(productsWithPricing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique vendors for filter
  const vendors = useMemo(() => {
    const vendorSet = new Set(products.map(p => p.vendor).filter(Boolean));
    return Array.from(vendorSet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.vendor?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    // Vendor filter
    if (selectedVendor) {
      result = result.filter(p => p.vendor === selectedVendor);
    }
    
    // Discount filter
    if (showOnlyDiscounted) {
      result = result.filter(p => p.discount > 0);
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'price-low':
        result.sort((a, b) => a.companyPrice - b.companyPrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.companyPrice - a.companyPrice);
        break;
      case 'discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }
    
    return result;
  }, [products, searchQuery, selectedVendor, showOnlyDiscounted, sortBy]);

  // Stats
  const stats = {
    total: products.length,
    discounted: products.filter(p => p.discount > 0).length,
    avgDiscount: products.length > 0 
      ? Math.round(products.reduce((sum, p) => sum + p.discount, 0) / products.length) 
      : 0,
    totalSavings: products.reduce((sum, p) => sum + (p.listPrice - p.companyPrice), 0),
  };

  const handleAddToCart = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Product Catalog</h4>
          <p className="mb-0 text-muted">Browse with exclusive B2B pricing</p>
        </div>
        <button 
          className="btn btn-icon btn-outline-secondary" 
          onClick={loadProducts}
          disabled={loading}
          title="Refresh"
        >
          <i className="ti ti-refresh"></i>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Products</p>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <i className="ti ti-package fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">On Sale</p>
                  <h3 className="mb-0 text-success">{stats.discounted}</h3>
                </div>
                <i className="ti ti-discount fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Avg. Discount</p>
                  <h3 className="mb-0 text-warning">{stats.avgDiscount}%</h3>
                </div>
                <i className="ti ti-percentage fs-1 text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Your Savings</p>
                  <h3 className="mb-0 text-info">{formatCurrency(stats.totalSavings)}</h3>
                </div>
                <i className="ti ti-pig-money fs-1 text-info opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><i className="ti ti-search"></i></span>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-control"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="ti ti-x"></i>
                  </button>
                )}
              </div>
            </div>
            
            {/* Vendor Filter */}
            <div className="col-md-2">
              <select 
                className="form-select"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                <option value="">All Vendors</option>
                {vendors.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div className="col-md-2">
              <select 
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            
            {/* Discount Filter */}
            <div className="col-md-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showDiscounted"
                  checked={showOnlyDiscounted}
                  onChange={(e) => setShowOnlyDiscounted(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showDiscounted">
                  On Sale Only
                </label>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="col-md-2 text-end">
              <div className="btn-group">
                <button 
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="ti ti-grid-dots"></i>
                </button>
                <button 
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="ti ti-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Error Alert */}
      {pricingError && (
        <div className="alert alert-warning alert-dismissible mb-3" role="alert">
          <i className="ti ti-alert-triangle me-2"></i>
          <strong>B2B Pricing Unavailable:</strong> Showing standard prices. Your discounts may not be reflected.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setPricingError(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Results Info */}
      {(searchQuery || selectedVendor || showOnlyDiscounted) && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedVendor('');
              setShowOnlyDiscounted(false);
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Loading products with B2B pricing...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-package-off ti-3x text-muted mb-3"></i>
            <h5>No products found</h5>
            <p className="text-muted mb-3">
              {searchQuery || selectedVendor || showOnlyDiscounted 
                ? 'Try adjusting your filters' 
                : 'Products will appear here after sync'
              }
            </p>
            {(searchQuery || selectedVendor || showOnlyDiscounted) && (
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVendor('');
                  setShowOnlyDiscounted(false);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="row g-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>List Price</th>
                  <th>Your Price</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th width="100"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="rounded"
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                        <div>
                          <a href={`/products/${product.id}`} className="fw-semibold text-body">
                            {product.title}
                          </a>
                          {product.variants?.[0]?.sku && (
                            <small className="d-block text-muted">SKU: {product.variants[0].sku}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark">{product.vendor}</span></td>
                    <td className="text-muted">{formatCurrency(product.listPrice)}</td>
                    <td className="fw-bold text-primary">{formatCurrency(product.companyPrice)}</td>
                    <td>
                      {product.discount > 0 ? (
                        <span className="badge bg-success">{product.discount}% OFF</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.inStock ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.inStock}
                      >
                        <i className="ti ti-shopping-cart"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}




