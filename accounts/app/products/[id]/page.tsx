'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@eagle/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountsFetch(`/api/v1/catalog/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to load product');
      }
      const data = await response.json();
      setProduct(data);
      if (data?.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product || !selectedVariant) return;
    
    setAdding(true);
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      // First ensure we have an active cart
      let cartResponse = await accountsFetch('/api/v1/carts/active');
      let cart = null;
      
      if (cartResponse.ok && cartResponse.status !== 204) {
        cart = await cartResponse.json();
      }
      
      // If no cart, create one
      if (!cart || !cart.id) {
        const merchantId = localStorage.getItem('eagle_merchantId') || '';
        const userId = localStorage.getItem('eagle_userId') || '';
        
        const createResponse = await accountsFetch('/api/v1/carts', {
          method: 'POST',
          body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
        });
        
        if (createResponse.ok) {
          cart = await createResponse.json();
        }
      }
      
      if (cart && cart.id) {
        // Add item to cart - use correct endpoint
        const addResponse = await accountsFetch(`/api/v1/carts/${cart.id}/items`, {
          method: 'POST',
          body: JSON.stringify({
            variantId: selectedVariant.id,
            shopifyVariantId: (selectedVariant.shopifyVariantId || selectedVariant.shopifyId || '').toString(),
            quantity: quantity,
          }),
        });
        
        if (addResponse.ok) {
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 3000);
        } else {
          const error = await addResponse.json().catch(() => ({}));
          console.error('Add to cart failed:', error);
          alert(error.message || 'Failed to add to cart');
        }
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAdding(false);
    }
  };

  const calculateSavings = () => {
    if (!selectedVariant) return 0;
    const listPrice = selectedVariant.compareAtPrice || selectedVariant.listPrice || selectedVariant.price;
    const unitPrice = selectedVariant.price;
    return Math.max(0, (listPrice - unitPrice) * quantity);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div className="spinner-apple"></div>
        <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <i className="ti ti-alert-circle ti-3x" style={{ color: 'var(--red)', marginBottom: 12, display: 'block' }}></i>
        <h5>Error loading product</h5>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{error}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={loadProduct} className="btn-apple btn-apple-primary">
            <i className="ti ti-refresh" style={{ marginRight: 4 }}></i>Try Again
          </button>
          <Link href="/products" className="btn-apple btn-apple-secondary">
            <i className="ti ti-arrow-left" style={{ marginRight: 4 }}></i>Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <i className="ti ti-package-off ti-3x" style={{ color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}></i>
        <h5>Product not found</h5>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>The product you're looking for doesn't exist or is no longer available.</p>
        <Link href="/products" className="btn-apple btn-apple-primary">
          <i className="ti ti-arrow-left" style={{ marginRight: 4 }}></i>Browse Products
        </Link>
      </div>
    );
  }

  const listPrice = selectedVariant?.compareAtPrice || selectedVariant?.listPrice || selectedVariant?.price || 0;
  const unitPrice = selectedVariant?.price || 0;
  const hasDiscount = listPrice > unitPrice;
  const discountPercent = hasDiscount ? Math.round((1 - unitPrice / listPrice) * 100) : 0;
  const savings = calculateSavings();

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 16 }}>
        <Link href="/products" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          <i className="ti ti-arrow-left" style={{ marginRight: 4 }}></i>Back to Products
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Product Images */}
        <div>
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]?.src || product.images[0]}
                  alt={product.title}
                  style={{ width: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 10 }}
                />
              ) : (
                <div style={{ background: 'var(--bg-secondary)', padding: 40, textAlign: 'center', borderRadius: 10, minHeight: 400 }}>
                  <i className="ti ti-photo-off ti-5x" style={{ color: 'var(--text-secondary)' }}></i>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>No image available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {product.images.slice(0, 6).map((img: any, i: number) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 60, height: 60 }}>
                  <img
                    src={img.src || img}
                    alt={`${product.title} ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="card">
            <div className="card-body">
              {/* Vendor */}
              {product.vendor && (
                <span className="badge" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', marginBottom: 8 }}>{product.vendor}</span>
              )}
              
              {/* Title */}
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{product.title}</h3>
              
              {/* SKU */}
              {selectedVariant?.sku && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                  <i className="ti ti-barcode" style={{ marginRight: 4 }}></i>SKU: {selectedVariant.sku}
                </p>
              )}
              
              {/* Pricing */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h2 style={{ color: 'var(--accent)', marginBottom: 0 }}>{formatCurrency(unitPrice)}</h2>
                  {hasDiscount && (
                    <>
                      <span style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: '1.1rem' }}>
                        {formatCurrency(listPrice)}
                      </span>
                      <span className="badge" style={{ background: 'var(--green)', color: '#fff', fontSize: '0.9rem' }}>-{discountPercent}%</span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge" style={{ background: 'var(--green)', color: '#fff' }}>
                    <i className="ti ti-building-store" style={{ marginRight: 4 }}></i>B2B Price
                  </span>
                  {hasDiscount && (
                    <span style={{ color: 'var(--green)', fontSize: 13 }}>
                      You save {formatCurrency(listPrice - unitPrice)} per unit
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Variant</label>
                  <select
                    className="form-input"
                    value={selectedVariant?.id || ''}
                    onChange={(e) => {
                      const variant = product.variants?.find((v: any) => v.id === e.target.value);
                      if (variant) setSelectedVariant(variant);
                    }}
                  >
                    {product.variants.map((variant: any) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.title} - {formatCurrency(variant.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', maxWidth: 150 }}>
                    <button
                      className="btn-apple btn-apple-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ borderRadius: '8px 0 0 8px' }}
                    >
                      <i className="ti ti-minus"></i>
                    </button>
                    <input
                      type="number"
                      className="form-input"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      style={{ textAlign: 'center', borderRadius: 0 }}
                    />
                    <button
                      className="btn-apple btn-apple-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ borderRadius: '0 8px 8px 0' }}
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Total: <strong style={{ color: 'var(--accent)' }}>{formatCurrency(unitPrice * quantity)}</strong>
                  </span>
                </div>
                {savings > 0 && (
                  <p style={{ color: 'var(--green)', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
                    <i className="ti ti-pig-money" style={{ marginRight: 4 }}></i>
                    You save {formatCurrency(savings)} with B2B pricing!
                  </p>
                )}
              </div>

              {/* Add to Cart */}
              <div style={{ display: 'grid', gap: 8 }}>
                <button
                  onClick={addToCart}
                  className="btn-apple btn-apple-primary"
                  style={addedToCart ? { background: 'var(--green)', fontSize: '1.1rem', padding: '12px 24px' } : { fontSize: '1.1rem', padding: '12px 24px' }}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-apple" style={{ width: 16, height: 16, marginRight: 8 }}></span>
                      Adding...
                    </>
                  ) : addedToCart ? (
                    <>
                      <i className="ti ti-check" style={{ marginRight: 8 }}></i>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <i className="ti ti-shopping-cart-plus" style={{ marginRight: 8 }}></i>
                      Add to Cart
                    </>
                  )}
                </button>
                {addedToCart && (
                  <Link href="/cart" className="btn-apple btn-apple-secondary" style={{ textAlign: 'center' }}>
                    <i className="ti ti-shopping-cart" style={{ marginRight: 8 }}></i>
                    View Cart
                  </Link>
                )}
              </div>

              {/* Stock Status */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-circle-check" style={{ color: 'var(--green)' }}></i>
                  <span style={{ color: 'var(--green)' }}>In Stock</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 0, marginTop: 8 }}>
                  <i className="ti ti-truck" style={{ marginRight: 4 }}></i>
                  Usually ships within 1-2 business days
                </p>
              </div>
            </div>
          </div>

          {/* Description Card */}
          {product.description && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: 0 }}>
                  <i className="ti ti-info-circle" style={{ marginRight: 8 }}></i>Product Description
                </h5>
              </div>
              <div className="card-body">
                <div 
                  style={{ color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-body">
                <h6 style={{ fontWeight: 600, marginBottom: 12 }}>
                  <i className="ti ti-tags" style={{ marginRight: 8 }}></i>Tags
                </h6>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(typeof product.tags === 'string' ? product.tags.split(',') : product.tags).map((tag: string, i: number) => (
                    <span key={i} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{tag.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

