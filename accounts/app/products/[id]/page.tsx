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
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await accountsFetch(`/api/v1/catalog/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
      if (data?.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err) {
      console.error(err);
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
        // Add item to cart
        const addResponse = await accountsFetch(`/api/v1/companies/${companyId}/cart`, {
          method: 'POST',
          body: JSON.stringify({
            productId: product.id,
            variantId: selectedVariant.id || selectedVariant.shopifyId,
            quantity: quantity,
          }),
        });
        
        if (addResponse.ok) {
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 3000);
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-5">
        <i className="ti ti-package-off ti-3x text-muted mb-3"></i>
        <h5>Product not found</h5>
        <p className="text-muted mb-3">The product you're looking for doesn't exist or is no longer available.</p>
        <Link href="/products" className="btn btn-primary">
          <i className="ti ti-arrow-left me-1"></i>Browse Products
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
      <nav className="mb-4">
        <Link href="/products" className="text-primary text-decoration-none">
          <i className="ti ti-arrow-left me-1"></i>Back to Products
        </Link>
      </nav>

      <div className="row g-4">
        {/* Product Images */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body p-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]?.src || product.images[0]}
                  alt={product.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light p-5 text-center rounded" style={{ minHeight: 400 }}>
                  <i className="ti ti-photo-off ti-5x text-muted"></i>
                  <p className="text-muted mt-3">No image available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="d-flex gap-2 mt-3 flex-wrap">
              {product.images.slice(0, 6).map((img: any, i: number) => (
                <div key={i} className="border rounded overflow-hidden" style={{ width: 60, height: 60 }}>
                  <img
                    src={img.src || img}
                    alt={`${product.title} ${i + 1}`}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              {/* Vendor */}
              {product.vendor && (
                <span className="badge bg-label-primary mb-2">{product.vendor}</span>
              )}
              
              {/* Title */}
              <h3 className="fw-bold mb-3">{product.title}</h3>
              
              {/* SKU */}
              {selectedVariant?.sku && (
                <p className="text-muted small mb-3">
                  <i className="ti ti-barcode me-1"></i>SKU: {selectedVariant.sku}
                </p>
              )}
              
              {/* Pricing */}
              <div className="bg-light rounded p-3 mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h2 className="text-primary mb-0">{formatCurrency(unitPrice)}</h2>
                  {hasDiscount && (
                    <>
                      <span className="text-muted text-decoration-line-through fs-5">
                        {formatCurrency(listPrice)}
                      </span>
                      <span className="badge bg-success fs-6">-{discountPercent}%</span>
                    </>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success">
                    <i className="ti ti-building-store me-1"></i>B2B Price
                  </span>
                  {hasDiscount && (
                    <span className="text-success small">
                      You save {formatCurrency(listPrice - unitPrice)} per unit
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Variant</label>
                  <select
                    className="form-select"
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
              <div className="mb-4">
                <label className="form-label fw-semibold">Quantity</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="input-group" style={{ maxWidth: 150 }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <i className="ti ti-minus"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>
                  <span className="text-muted">
                    Total: <strong className="text-primary">{formatCurrency(unitPrice * quantity)}</strong>
                  </span>
                </div>
                {savings > 0 && (
                  <p className="text-success small mt-2 mb-0">
                    <i className="ti ti-pig-money me-1"></i>
                    You save {formatCurrency(savings)} with B2B pricing!
                  </p>
                )}
              </div>

              {/* Add to Cart */}
              <div className="d-grid gap-2">
                <button
                  onClick={addToCart}
                  className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : addedToCart ? (
                    <>
                      <i className="ti ti-check me-2"></i>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <i className="ti ti-shopping-cart-plus me-2"></i>
                      Add to Cart
                    </>
                  )}
                </button>
                {addedToCart && (
                  <Link href="/cart" className="btn btn-outline-primary">
                    <i className="ti ti-shopping-cart me-2"></i>
                    View Cart
                  </Link>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-4 pt-4 border-top">
                <div className="d-flex align-items-center gap-2">
                  <i className="ti ti-circle-check text-success"></i>
                  <span className="text-success">In Stock</span>
                </div>
                <p className="text-muted small mb-0 mt-2">
                  <i className="ti ti-truck me-1"></i>
                  Usually ships within 1-2 business days
                </p>
              </div>
            </div>
          </div>

          {/* Description Card */}
          {product.description && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="ti ti-info-circle me-2"></i>Product Description
                </h5>
              </div>
              <div className="card-body">
                <div 
                  className="text-muted"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="card mt-4">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">
                  <i className="ti ti-tags me-2"></i>Tags
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {(typeof product.tags === 'string' ? product.tags.split(',') : product.tags).map((tag: string, i: number) => (
                    <span key={i} className="badge bg-label-secondary">{tag.trim()}</span>
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

