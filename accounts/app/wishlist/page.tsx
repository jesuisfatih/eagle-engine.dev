'use client';

import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('eagle_wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(item => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem('eagle_wishlist', JSON.stringify(updated));
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Wishlist</h4>
      
      {wishlist.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-heart ti-3x text-muted mb-3"></i>
            <h5>No items in wishlist</h5>
            <p className="text-muted">Save products to your wishlist for later</p>
            <a href="/products" className="btn btn-primary mt-2">
              Browse Products
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item.id} className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{item.title}</h6>
                  <p className="text-muted small">{item.vendor}</p>
                  <div className="mb-3">
                    <span className="fw-bold text-primary">${item.price}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <a href={`/products/${item.id}`} className="btn btn-sm btn-primary flex-fill">
                      View
                    </a>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="btn btn-sm btn-text-danger"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

