'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  title?: string;
  productTitle?: string;
  variantTitle?: string;
  vendor?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  productImage?: string;
  addedAt: string;
  inStock?: boolean;
  sku?: string;
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAdding, setBulkAdding] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('eagle_userId') || '';
      
      const response = await accountsFetch(`/api/v1/users/${userId}/wishlist`);
      
      if (response.ok) {
        const data = await response.json();
        const apiWishlist = Array.isArray(data) ? data : data.items || [];
        setWishlist(apiWishlist);
        localStorage.setItem('eagle_wishlist', JSON.stringify(apiWishlist));
      } else {
        const saved = localStorage.getItem('eagle_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
      }
    } catch (err) {
      const saved = localStorage.getItem('eagle_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string, productId: string) => {
    try {
      setRemoving(itemId);
      const userId = localStorage.getItem('eagle_userId') || '';
      
      await accountsFetch(`/api/v1/users/${userId}/wishlist/${productId}`, { method: 'DELETE' });
      
      const updated = wishlist.filter(item => item.id !== itemId);
      setWishlist(updated);
      setSelectedItems(prev => { prev.delete(itemId); return new Set(prev); });
      localStorage.setItem('eagle_wishlist', JSON.stringify(updated));
    } catch (err) {
      const updated = wishlist.filter(item => item.id !== itemId);
      setWishlist(updated);
      localStorage.setItem('eagle_wishlist', JSON.stringify(updated));
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (item: WishlistItem) => {
    try {
      setAddingToCart(item.id);
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      // First get or create active cart
      let cartResponse = await accountsFetch('/api/v1/carts/active');
      let cart = null;
      
      if (cartResponse.ok && cartResponse.status !== 204) {
        cart = await cartResponse.json().catch(() => null);
      }
      
      if (!cart || !cart.id) {
        const createResponse = await accountsFetch('/api/v1/carts', {
          method: 'POST',
          body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
        });
        if (createResponse.ok) {
          cart = await createResponse.json();
        }
      }
      
      if (cart && cart.id) {
        const response = await accountsFetch(`/api/v1/carts/${cart.id}/items`, {
          method: 'POST',
          body: JSON.stringify({
            variantId: item.variantId || item.productId,
            shopifyVariantId: (item.variantId || item.productId || '').toString(),
            quantity: 1,
          }),
        });
        
        if (response.ok) {
          // Show success feedback
          alert('Added to cart!');
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.message || 'Failed to add to cart');
        }
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const addSelectedToCart = async () => {
    if (selectedItems.size === 0) return;
    
    setBulkAdding(true);
    const merchantId = localStorage.getItem('eagle_merchantId') || '';
    const companyId = localStorage.getItem('eagle_companyId') || '';
    const userId = localStorage.getItem('eagle_userId') || '';
    
    // First get or create active cart
    let cartResponse = await accountsFetch('/api/v1/carts/active');
    let cart = null;
    
    if (cartResponse.ok && cartResponse.status !== 204) {
      cart = await cartResponse.json().catch(() => null);
    }
    
    if (!cart || !cart.id) {
      const createResponse = await accountsFetch('/api/v1/carts', {
        method: 'POST',
        body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
      });
      if (createResponse.ok) {
        cart = await createResponse.json();
      }
    }
    
    if (!cart || !cart.id) {
      alert('Failed to create cart');
      setBulkAdding(false);
      return;
    }
    
    let successCount = 0;
    for (const itemId of selectedItems) {
      const item = wishlist.find(w => w.id === itemId);
      if (item) {
        try {
          const response = await accountsFetch(`/api/v1/carts/${cart.id}/items`, {
            method: 'POST',
            body: JSON.stringify({
              variantId: item.variantId || item.productId,
              shopifyVariantId: (item.variantId || item.productId || '').toString(),
              quantity: 1,
            }),
          });
          if (response.ok) successCount++;
        } catch (err) {
          console.error('Failed to add item:', err);
        }
      }
    }
    
    alert(`Added ${successCount} of ${selectedItems.size} items to cart`);
    setSelectedItems(new Set());
    setBulkAdding(false);
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === wishlist.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlist.map(w => w.id)));
    }
  };

  // Sort wishlist
  const sortedWishlist = [...wishlist].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest': return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      case 'name': return (a.title || a.productTitle || '').localeCompare(b.title || b.productTitle || '');
      default: return 0;
    }
  });

  // Calculate totals
  const totalValue = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Wishlist</h4>
          <p className="mb-0 text-muted">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} • Total value: {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="d-flex gap-2">
          {selectedItems.size > 0 && (
            <button 
              className="btn btn-primary"
              onClick={addSelectedToCart}
              disabled={bulkAdding}
            >
              {bulkAdding ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="ti ti-shopping-cart me-1"></i>
              )}
              Add {selectedItems.size} to Cart
            </button>
          )}
          <button 
            className="btn btn-icon btn-outline-secondary" 
            onClick={loadWishlist}
            title="Refresh"
          >
            <i className="ti ti-refresh"></i>
          </button>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-heart ti-3x text-muted mb-3"></i>
            <h5>Your wishlist is empty</h5>
            <p className="text-muted mb-3">Save products you're interested in for later</p>
            <a href="/products" className="btn btn-primary">
              <i className="ti ti-package me-1"></i>Browse Products
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="selectAll"
                checked={selectedItems.size === wishlist.length && wishlist.length > 0}
                onChange={selectAll}
              />
              <label className="form-check-label" htmlFor="selectAll">
                Select All
              </label>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <label className="text-muted small me-1">Sort by:</label>
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="row g-4">
            {sortedWishlist.map((item) => {
              const itemTitle = item.title || item.productTitle || 'Product';
              const itemImage = item.image || item.productImage;
              const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price;
              const isSelected = selectedItems.has(item.id);
              
              return (
                <div key={item.id} className="col-md-4 col-lg-3">
                  <div className={`card h-100 ${isSelected ? 'border-primary border-2' : ''}`}>
                    {/* Selection Checkbox */}
                    <div className="position-absolute top-0 start-0 m-2 z-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                        style={{ width: 20, height: 20 }}
                      />
                    </div>
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="position-absolute top-0 end-0 m-2 z-1">
                        <span className="badge bg-danger">
                          -{Math.round((1 - item.price / item.compareAtPrice!) * 100)}%
                        </span>
                      </div>
                    )}
                    
                    {/* Image */}
                    <a href={`/products/${item.productId}`} className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '180px'}}>
                      {itemImage ? (
                        <img 
                          src={itemImage} 
                          alt={itemTitle}
                          style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}}
                        />
                      ) : (
                        <i className="ti ti-photo ti-2x text-muted"></i>
                      )}
                    </a>
                    
                    <div className="card-body d-flex flex-column">
                      {/* Vendor */}
                      {item.vendor && (
                        <p className="text-muted small mb-1">{item.vendor}</p>
                      )}
                      
                      {/* Title */}
                      <h6 className="card-title mb-1 text-truncate-2" title={itemTitle}>
                        <a href={`/products/${item.productId}`} className="text-body">
                          {itemTitle}
                        </a>
                      </h6>
                      
                      {/* SKU */}
                      {item.sku && (
                        <small className="text-muted mb-2">SKU: {item.sku}</small>
                      )}
                      
                      {/* Price */}
                      <div className="mb-3 mt-auto">
                        <span className="fw-bold text-primary fs-5">{formatCurrency(item.price)}</span>
                        {hasDiscount && (
                          <small className="text-muted text-decoration-line-through ms-2">
                            {formatCurrency(item.compareAtPrice!)}
                          </small>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      {item.inStock !== undefined && (
                        <div className="mb-2">
                          <span className={`badge ${item.inStock ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="btn btn-sm btn-primary flex-grow-1"
                          disabled={addingToCart === item.id || item.inStock === false}
                        >
                          {addingToCart === item.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <i className="ti ti-shopping-cart me-1"></i>Add to Cart
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id, item.productId)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={removing === item.id}
                          title="Remove"
                        >
                          {removing === item.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="ti ti-trash"></i>
                          )}
                        </button>
                      </div>
                      
                      {/* Added Date */}
                      <small className="text-muted mt-2">
                        <i className="ti ti-clock me-1"></i>
                        Added {formatRelativeTime(item.addedAt)}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

