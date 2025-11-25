'use client';

interface ProductCardProps {
  product: any;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="col-md-4">
      <div className="card h-100">
        <div className="card-body">
          <a href={`/products/${product.id}`} className="text-decoration-none">
            <h5 className="card-title text-dark">{product.title}</h5>
          </a>
          <p className="card-text small text-muted">{product.vendor}</p>
          
          <div className="mt-3 mb-3">
            <h4 className="text-primary mb-0">${product.companyPrice || product.listPrice || 0}</h4>
            {product.discount > 0 && (
              <div>
                <span className="text-muted small text-decoration-line-through">${product.listPrice}</span>
                <span className="badge bg-label-success ms-2">-{product.discount.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {product.variants?.[0] && (
            <div className="mb-2">
              <span className="badge bg-label-info small">
                {product.variants[0].inventoryQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              onClick={() => onAddToCart(product.id)}
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
                alert('✅ Added to wishlist!');
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

