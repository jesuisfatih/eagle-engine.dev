'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';

interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  title?: string;
  productTitle?: string;
  variantTitle?: string;
  vendor?: string;
  price: number;
  image?: string;
  productImage?: string;
  addedAt: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('eagle_userId') || '';
      
      // Try to load from API first
      const response = await accountsFetch(`/api/v1/users/${userId}/wishlist`);
      
      if (response.ok) {
        const data = await response.json();
        const apiWishlist = Array.isArray(data) ? data : data.items || [];
        setWishlist(apiWishlist);
        // Sync to localStorage as backup
        localStorage.setItem('eagle_wishlist', JSON.stringify(apiWishlist));
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('eagle_wishlist');
        if (saved) {
          setWishlist(JSON.parse(saved));
        }
      }
    } catch (err) {
      // Fallback to localStorage
      const saved = localStorage.getItem('eagle_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string, productId: string) => {
    try {
      setRemoving(itemId);
      const userId = localStorage.getItem('eagle_userId') || '';
      
      // Try API first
      const response = await accountsFetch(`/api/v1/users/${userId}/wishlist/${productId}`, {
        method: 'DELETE',
      });
      
      // Update local state regardless of API result
      const updated = wishlist.filter(item => item.id !== itemId);
      setWishlist(updated);
      localStorage.setItem('eagle_wishlist', JSON.stringify(updated));
      
    } catch (err) {
      // Still update local state
      const updated = wishlist.filter(item => item.id !== itemId);
      setWishlist(updated);
      localStorage.setItem('eagle_wishlist', JSON.stringify(updated));
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (item: WishlistItem) => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      await accountsFetch(`/api/v1/companies/${companyId}/cart`, {
        method: 'POST',
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.productId, // May need to be the actual variant ID
          quantity: 1,
        }),
      });
      
      // Show success (you could add a toast here)
      alert('Added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Wishlist</h4>
        {wishlist.length > 0 && (
          <span className="text-muted">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      
      {wishlist.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-heart fs-1 text-muted mb-3 d-block"></i>
            <h5>No items in wishlist</h5>
            <p className="text-muted">Save products to your wishlist for later</p>
            <a href="/products" className="btn btn-primary mt-2">
              Browse Products
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => {
            const itemTitle = item.title || item.productTitle || 'Product';
            const itemImage = item.image || item.productImage;
            
            return (
            <div key={item.id} className="col-md-4 col-lg-3">
              <div className="card h-100">
                {itemImage && (
                  <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '150px'}}>
                    <img 
                      src={itemImage} 
                      alt={itemTitle}
                      style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}}
                    />
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1">{itemTitle}</h6>
                  {item.vendor && (
                    <p className="text-muted small mb-2">{item.vendor}</p>
                  )}
                  <div className="mb-3 mt-auto">
                    <span className="fw-bold text-primary fs-5">${item.price?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <a href={`/products/${item.productId}`} className="btn btn-sm btn-label-primary flex-fill">
                      View
                    </a>
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-sm btn-primary"
                      title="Add to cart"
                    >
                      <i className="ti ti-shopping-cart"></i>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id, item.productId)}
                      className="btn btn-sm btn-text-danger"
                      disabled={removing === item.id}
                      title="Remove from wishlist"
                    >
                      {removing === item.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="ti ti-heart-off"></i>
                      )}
                    </button>
                  </div>
                  <small className="text-muted mt-2">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}

