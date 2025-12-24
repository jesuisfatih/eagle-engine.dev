'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { accountsFetch } from '@/lib/api-client';
import type { Product } from '@eagle/types';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await accountsFetch(`/api/v1/catalog/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    alert('Add to cart: ' + product?.title);
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }

  if (!product) {
    return <div className="alert alert-danger">Product not found</div>;
  }

  return (
    <div>
      <nav className="mb-4">
        <Link href="/products" className="text-primary">
          <i className="ti ti-arrow-left me-1"></i>
          Back to Products
        </Link>
      </nav>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="bg-light p-5 text-center rounded mb-3">
                <i className="ti ti-package ti-3x text-muted"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h3 className="fw-bold mb-2">{product.title}</h3>
          <p className="text-muted mb-3">{product.vendor}</p>
          
          <div className="mb-4">
            <h2 className="text-primary mb-2">${product.variants?.[0]?.price || 0}</h2>
            <span className="badge bg-label-success">Your B2B Price</span>
          </div>

          <div className="mb-4">
            <label className="form-label">Quantity</label>
            <div className="input-group" style={{maxWidth: '150px'}}>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <input
                type="text"
                className="form-control text-center"
                value={quantity}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>
          </div>

          <button onClick={addToCart} className="btn btn-primary btn-lg w-100 mb-3">
            <i className="ti ti-shopping-cart-plus me-2"></i>
            Add to Cart
          </button>

          {product.description && (
            <div className="mt-4">
              <h5 className="fw-bold mb-2">Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

