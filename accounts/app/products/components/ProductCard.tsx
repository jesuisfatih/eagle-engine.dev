'use client';

import { formatCurrency, calculateDiscount } from '@/lib/utils';
import type { ProductVariant, QuantityBreak } from '@/types';

// Extended product for display
interface ProductForDisplay {
  id: string;
  title: string;
  vendor: string;
  companyPrice?: number;
  listPrice?: number;
  discount?: number;
  variants?: ProductVariant[];
  imageUrl?: string;
  quantityBreaks?: QuantityBreak[];
}

interface ProductCardProps {
  product: ProductForDisplay;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const listPrice = product.listPrice || 0;
  const companyPrice = product.companyPrice || listPrice;
  const hasDiscount = companyPrice < listPrice;
  const discountPercent = hasDiscount ? calculateDiscount(listPrice, companyPrice) : 0;
  const hasQuantityBreaks = product.quantityBreaks && product.quantityBreaks.length > 0;
  const inStock = (product.variants?.[0]?.inventoryQuantity || 0) > 0;

  return (
    <div className="col-md-4">
      <div className="card h-100">
        {/* Product Image */}
        {product.imageUrl && (
          <a href={`/products/${product.id}`}>
            <img 
              src={product.imageUrl} 
              alt={product.title}
              className="card-img-top"
              style={{ height: 200, objectFit: 'cover' }}
            />
          </a>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-success">
              -{discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Volume Discount Badge */}
        {hasQuantityBreaks && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-info">
              <i className="ti ti-package me-1"></i>
              Volume Pricing
            </span>
          </div>
        )}

        <div className="card-body">
          <a href={`/products/${product.id}`} className="text-decoration-none">
            <h5 className="card-title text-dark">{product.title}</h5>
          </a>
          <p className="card-text small text-muted">{product.vendor}</p>
          
          {/* Enhanced Price Display */}
          <div className="mt-3 mb-3">
            {/* Your Price */}
            <div className="d-flex align-items-baseline gap-2">
              <h4 className="text-success mb-0">
                {formatCurrency(companyPrice)}
              </h4>
              {hasDiscount && (
                <span className="text-muted text-decoration-line-through small">
                  {formatCurrency(listPrice)}
                </span>
              )}
            </div>
            
            {/* Savings Badge */}
            {hasDiscount && (
              <div className="mt-1">
                <span className="badge bg-success">
                  <i className="ti ti-tag me-1"></i>
                  Your B2B Price - Save {discountPercent}%
                </span>
              </div>
            )}

            {/* Quantity Breaks Preview */}
            {hasQuantityBreaks && (
              <div className="mt-2 p-2 bg-light rounded small">
                <div className="d-flex align-items-center text-muted mb-1">
                  <i className="ti ti-trending-down me-1"></i>
                  Volume Discounts:
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {product.quantityBreaks!.slice(0, 3).map((breakItem) => (
                    <span key={breakItem.qty} className="badge bg-label-info">
                      {breakItem.qty}+ @ {formatCurrency(breakItem.price)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.variants?.[0] && (
            <div className="mb-2">
              <span className={`badge ${inStock ? 'bg-label-success' : 'bg-label-warning'} small`}>
                {inStock 
                  ? `In Stock (${product.variants[0].inventoryQuantity})`
                  : 'Limited Stock - Contact Sales'
                }
              </span>
            </div>
          )}

          {/* Action Buttons */}

          <div className="d-flex gap-2">
            <button
              onClick={async () => {
                const modal = document.createElement('div');
                modal.className = 'modal fade show d-block';
                modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                modal.innerHTML = `
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-body text-center py-4">
                        <div class="spinner-border text-primary mb-3"></div>
                        <p>Adding to cart...</p>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);

                try {
                  await onAddToCart(product.id);
                  modal.remove();
                  
                  const successModal = document.createElement('div');
                  successModal.className = 'modal fade show d-block';
                  successModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                  successModal.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title">✅ Success</h5>
                          <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                        </div>
                        <div class="modal-body">Product added to cart!</div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue Shopping</button>
                          <a href="/cart" class="btn btn-success">View Cart</a>
                        </div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(successModal);
              } catch (err) {
                modal.remove();
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                const errorModal = document.createElement('div');
                errorModal.className = 'modal fade show d-block';
                errorModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                errorModal.innerHTML = `
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">❌ Error</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                      </div>
                      <div class="modal-body">Failed to add to cart: ${errorMessage}</div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(errorModal);
              }
              }}
              className="btn btn-primary flex-fill"
              disabled={product.variants?.[0]?.inventoryQuantity === 0}
            >
              <i className="ti ti-shopping-cart-plus me-1"></i>
              {product.variants?.[0]?.inventoryQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={() => {
                const wishlist = JSON.parse(localStorage.getItem('eagle_wishlist') || '[]');
                wishlist.push({
                  id: product.id,
                  title: product.title,
                  vendor: product.vendor,
                  price: product.companyPrice || product.listPrice,
                });
                localStorage.setItem('eagle_wishlist', JSON.stringify(wishlist));
                
                const modal = document.createElement('div');
                modal.className = 'modal fade show d-block';
                modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                modal.innerHTML = `
                  <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                      <div class="modal-body text-center py-4">
                        <i class="ti ti-heart ti-3x text-danger mb-3"></i>
                        <h5>Added to Wishlist!</h5>
                        <button type="button" class="btn btn-primary mt-3" onclick="this.closest('.modal').remove()">OK</button>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
              }}
              className="btn btn-label-secondary"
              title="Add to Wishlist"
            >
              <i className="ti ti-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

