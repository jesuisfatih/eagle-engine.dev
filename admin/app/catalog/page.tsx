'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';
import Modal from '@/components/Modal';

interface Product {
  id: string;
  shopifyProductId: string;
  title: string;
  vendor: string;
  status: string;
  variants: {
    id: string;
    title: string;
    price: number;
    sku: string;
  }[];
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [infoModal, setInfoModal] = useState<{show: boolean; product: Product | null}>({
    show: false,
    product: null
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/catalog/products?limit=500');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      setSyncing(true);
      const response = await adminFetch('/api/v1/sync/products', { method: 'POST' });
      
      if (response.ok) {
        setResultModal({
          show: true,
          message: '✅ Products sync started! Check back in a few minutes.',
          type: 'success'
        });
        setTimeout(loadProducts, 5000);
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({
          show: true,
          message: `❌ ${error.message || 'Failed to start product sync'}`,
          type: 'error'
        });
      }
    } catch (err) {
      setResultModal({
        show: true,
        message: `❌ ${err instanceof Error ? err.message : 'Failed to start product sync'}`,
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.vendor?.toLowerCase().includes(query) ||
      p.shopifyProductId?.includes(query)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Product Catalog</h4>
          <p className="mb-0 text-muted">{filteredProducts.length} of {products.length} products</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            style={{maxWidth: '250px'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={syncProducts}
            className="btn btn-primary"
            disabled={syncing}
          >
            {syncing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Syncing...
              </>
            ) : (
              <>
                <i className="ti ti-refresh me-1"></i>
                Sync Products
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredProducts.length === 0 ? (
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="ti ti-package fs-1 text-muted mb-3 d-block"></i>
                  <h5>{searchQuery ? 'No products match your search' : 'No products synced'}</h5>
                  <p className="text-muted">
                    {searchQuery ? 'Try a different search term' : 'Click "Sync Products" to import from Shopify'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title mb-1">{product.title}</h6>
                    <p className="text-muted small mb-2">{product.vendor}</p>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="small">Variants: {product.variants?.length || 0}</span>
                      <span className={`badge ${product.status === 'active' ? 'bg-label-success' : 'bg-label-secondary'}`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="mb-3 mt-auto">
                      <span className="fw-bold text-primary fs-5">
                        ${parseFloat(String(product.variants?.[0]?.price || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => {
                          window.location.href = `/pricing?productId=${product.shopifyProductId}`;
                        }}
                        className="btn btn-sm btn-primary flex-fill"
                      >
                        <i className="ti ti-tag me-1"></i>
                        Set Pricing
                      </button>
                      <button
                        onClick={() => setInfoModal({show: true, product})}
                        className="btn btn-sm btn-label-secondary"
                        title="View Details"
                      >
                        <i className="ti ti-info-circle"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Info Modal */}
      {infoModal.show && infoModal.product && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Product Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setInfoModal({show: false, product: null})}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th className="w-50">Title</th>
                      <td>{infoModal.product.title}</td>
                    </tr>
                    <tr>
                      <th>Vendor</th>
                      <td>{infoModal.product.vendor || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Shopify ID</th>
                      <td><code>{infoModal.product.shopifyProductId}</code></td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        <span className={`badge ${infoModal.product.status === 'active' ? 'bg-label-success' : 'bg-label-secondary'}`}>
                          {infoModal.product.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Variants</th>
                      <td>{infoModal.product.variants?.length || 0}</td>
                    </tr>
                  </tbody>
                </table>
                
                {infoModal.product.variants && infoModal.product.variants.length > 0 && (
                  <>
                    <h6 className="mt-3 mb-2">Variants</h6>
                    <div className="table-responsive" style={{maxHeight: '200px'}}>
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>SKU</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {infoModal.product.variants.slice(0, 10).map((v) => (
                            <tr key={v.id}>
                              <td>{v.title}</td>
                              <td><code>{v.sku || 'N/A'}</code></td>
                              <td>${parseFloat(String(v.price || 0)).toFixed(2)}</td>
                            </tr>
                          ))}
                          {infoModal.product.variants.length > 10 && (
                            <tr>
                              <td colSpan={3} className="text-muted text-center">
                                +{infoModal.product.variants.length - 10} more variants
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setInfoModal({show: false, product: null});
                    window.location.href = `/pricing?productId=${infoModal.product?.shopifyProductId}`;
                  }}
                >
                  <i className="ti ti-tag me-1"></i>
                  Set Pricing
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setInfoModal({show: false, product: null})}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: '', type: 'success'})}
          onConfirm={() => setResultModal({show: false, message: '', type: 'success'})}
          title={resultModal.type === 'success' ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.type === 'success' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

