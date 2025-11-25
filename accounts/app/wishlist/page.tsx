'use client';

export default function WishlistPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Wishlist</h4>
      
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
    </div>
  );
}

