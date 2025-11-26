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
                  alert('❌ Failed to add to cart');
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

