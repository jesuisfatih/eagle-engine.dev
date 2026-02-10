'use client';

import { PageHeader, showToast } from '@/components/ui';
import { adminFetch } from '@/lib/api-client';
import { useCallback, useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  status: string;
  images: { src: string }[];
  variants: { price: string; sku: string; inventoryQuantity: number }[];
  shopifyProductId?: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/v1/catalog/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || data.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const syncProducts = async () => {
    setSyncing(true);
    try {
      await adminFetch('/api/v1/sync/products', { method: 'POST' });
      showToast('Product sync started!', 'success');
      setTimeout(loadProducts, 3000);
    } catch { showToast('Sync failed', 'danger'); }
    finally { setSyncing(false); }
  };

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Product Catalog" subtitle={`${products.length} products`}
        actions={[
          { label: syncing ? 'Syncing...' : 'Sync Products', icon: 'refresh', variant: 'primary', onClick: syncProducts, disabled: syncing },
        ]} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="input-apple" style={{ flex: 1, maxWidth: 360 }}>
          <i className="ti ti-search input-icon" />
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)', alignSelf: 'center' }}>{filtered.length} products</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="apple-card" style={{ padding: 16 }}>
              <div className="skeleton" style={{ height: 160, marginBottom: 12, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 64 }}>
          <div className="empty-state-icon"><i className="ti ti-package" /></div>
          <h4 className="empty-state-title">No products found</h4>
          <p className="empty-state-desc">Sync products from Shopify to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(product => (
            <div key={product.id} className="apple-card" style={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setSelected(product)}>
              <div style={{
                height: 160, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid var(--border-light)',
              }}>
                {product.images?.[0]?.src ? (
                  <img src={product.images[0].src} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <i className="ti ti-photo-off" style={{ fontSize: 32, color: 'var(--text-quaternary)' }} />
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{product.vendor}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    ${parseFloat(product.variants?.[0]?.price || '0').toFixed(2)}
                  </span>
                  <span className={`badge-apple ${product.status === 'active' ? 'success' : 'secondary'}`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && (
        <div className="apple-modal-overlay" onClick={() => setSelected(null)}>
          <div className="apple-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="apple-modal-header">
              <h3 className="apple-modal-title">{selected.title}</h3>
            </div>
            <div className="apple-modal-body">
              {selected.images?.[0]?.src && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img src={selected.images[0].src} alt={selected.title} style={{ maxHeight: 200, borderRadius: 8 }} />
                </div>
              )}
              <table className="apple-table" style={{ fontSize: 13 }}>
                <tbody>
                  <tr><td style={{ fontWeight: 500 }}>Vendor</td><td>{selected.vendor || '-'}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Type</td><td>{selected.productType || '-'}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Status</td><td><span className={`badge-apple ${selected.status === 'active' ? 'success' : 'secondary'}`}>{selected.status}</span></td></tr>
                  <tr><td style={{ fontWeight: 500 }}>SKU</td><td>{selected.variants?.[0]?.sku || '-'}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Price</td><td>${parseFloat(selected.variants?.[0]?.price || '0').toFixed(2)}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>Inventory</td><td>{selected.variants?.[0]?.inventoryQuantity ?? '-'}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="apple-modal-footer">
              {selected.shopifyProductId && (
                <a href={`https://admin.shopify.com/store/eagledtfsupply/products/${selected.shopifyProductId}`}
                  target="_blank" rel="noopener noreferrer" className="btn-apple secondary" style={{ textDecoration: 'none' }}>
                  <i className="ti ti-external-link" /> View in Shopify
                </a>
              )}
              <button className="btn-apple primary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
