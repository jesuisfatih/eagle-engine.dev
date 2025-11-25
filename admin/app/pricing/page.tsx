'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';

export default function PricingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean; ruleId: string | null}>({
    show: false,
    ruleId: null,
  });
  const [resultModal, setResultModal] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({
    show: false,
    type: 'success',
    message: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetType: 'all',
    targetCompanyId: '',
    targetCompanyGroup: '',
    scopeType: 'all',
    scopeProductIds: [] as number[],
    scopeCollectionIds: [] as number[],
    scopeTags: '',
    scopeVariantIds: [] as number[],
    discountType: 'percentage',
    discountPercentage: 0,
    discountValue: 0,
    qtyBreaks: [] as any[],
    minCartAmount: 0,
    priority: 0,
    isActive: true,
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadRules();
    loadCompanies();
    loadProducts();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  const loadProducts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/catalog/products?limit=100`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  const loadRules = async () => {
    try {
      const data = await apiClient.getPricingRules();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.createPricingRule(formData);
      setShowCreateModal(false);
      setResultModal({
        show: true,
        type: 'success',
        message: 'Pricing rule created successfully!',
      });
      setTimeout(() => loadRules(), 1000);
    } catch (err: any) {
      setResultModal({
        show: true,
        type: 'error',
        message: err.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.ruleId) return;
    try {
      await apiClient.deletePricingRule(deleteModal.ruleId);
      setResultModal({
        show: true,
        type: 'success',
        message: 'Rule deleted successfully!',
      });
      setTimeout(() => loadRules(), 1000);
    } catch (err: any) {
      setResultModal({
        show: true,
        type: 'error',
        message: err.message,
      });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Pricing Rules</h4>
          <p className="mb-0 text-muted">Configure custom B2B pricing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          Create Pricing Rule
        </button>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-1">Active Rules</h6>
              <h3 className="mb-0">{rules.filter(r => r.isActive).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-1">Total Rules</h6>
              <h3 className="mb-0">{rules.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="card">
        <div className="card-body">
          {rules.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-discount ti-3x text-muted mb-3"></i>
              <h5>No pricing rules yet</h5>
              <p className="text-muted">Create your first rule to offer custom B2B pricing</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-2">
                Create First Rule
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rule Name</th>
                    <th>Target</th>
                    <th>Discount</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="fw-semibold">{rule.name}</td>
                      <td>{rule.targetType}</td>
                      <td className="text-success fw-semibold">
                        {rule.discountPercentage ? `${rule.discountPercentage}%` : `$${rule.discountValue}`}
                      </td>
                      <td>
                        <span className="badge bg-label-primary">{rule.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${rule.isActive ? 'bg-label-success' : 'bg-label-secondary'}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-icon btn-text-secondary me-1">
                          <i className="ti ti-edit"></i>
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, ruleId: rule.id })}
                          className="btn btn-sm btn-icon btn-text-danger"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Pricing Rule</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Rule Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., VIP Companies 25% Off"
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">🎯 Target (Kime?)</label>
                    <select
                      className="form-select"
                      value={formData.targetType}
                      onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                    >
                      <option value="all">All Companies</option>
                      <option value="company">Specific Company</option>
                      <option value="company_group">Company Group (VIP, Wholesale)</option>
                    </select>
                  </div>

                  {formData.targetType === 'company' && (
                    <div className="col-md-6">
                      <label className="form-label">Select Company</label>
                      <select
                        className="form-select"
                        value={formData.targetCompanyId}
                        onChange={(e) => setFormData({...formData, targetCompanyId: e.target.value})}
                      >
                        <option value="">Choose company...</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetType === 'company_group' && (
                    <div className="col-md-6">
                      <label className="form-label">Group Name</label>
                      <input
                        className="form-control"
                        value={formData.targetCompanyGroup}
                        onChange={(e) => setFormData({...formData, targetCompanyGroup: e.target.value})}
                        placeholder="e.g., VIP, Wholesale, Retail"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">📦 Scope (Neye?)</label>
                  <select
                    className="form-select"
                    value={formData.scopeType}
                    onChange={(e) => setFormData({...formData, scopeType: e.target.value})}
                  >
                    <option value="all">All Products</option>
                    <option value="products">Specific Products (Birden fazla seçilebilir)</option>
                    <option value="collections">Collections/Categories</option>
                    <option value="tags">Product Tags</option>
                    <option value="variants">Specific Variants</option>
                  </select>
                </div>

                {formData.scopeType === 'products' && (
                  <div className="mb-3">
                    <label className="form-label">Select Products (Multiple)</label>
                    <select
                      multiple
                      className="form-select"
                      style={{ height: '150px' }}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(o => parseInt(o.value));
                        setFormData({...formData, scopeProductIds: selected});
                      }}
                    >
                      {products.map(p => (
                        <option key={p.shopifyProductId} value={p.shopifyProductId}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Hold Ctrl/Cmd to select multiple products</small>
                  </div>
                )}

                {formData.scopeType === 'collections' && (
                  <div className="mb-3">
                    <label className="form-label">Collection IDs (comma-separated)</label>
                    <input
                      className="form-control"
                      placeholder="e.g., 12345, 67890"
                      onChange={(e) => {
                        const ids = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                        setFormData({...formData, scopeCollectionIds: ids});
                      }}
                    />
                    <small className="text-muted">Enter Shopify collection IDs separated by commas</small>
                  </div>
                )}

                {formData.scopeType === 'tags' && (
                  <div className="mb-3">
                    <label className="form-label">Product Tags (comma-separated)</label>
                    <input
                      className="form-control"
                      value={formData.scopeTags}
                      onChange={(e) => setFormData({...formData, scopeTags: e.target.value})}
                      placeholder="e.g., electronics, wholesale, featured"
                    />
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">💰 Discount Type</label>
                    <select
                      className="form-select"
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="fixed_amount">Fixed Amount Off ($)</option>
                      <option value="fixed_price">Fixed Price</option>
                      <option value="qty_break">Quantity Breaks</option>
                      <option value="cart_total">Cart Total Based</option>
                    </select>
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div className="col-md-6">
                      <label className="form-label">Discount Percentage</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})}
                        placeholder="e.g., 25"
                      />
                    </div>
                  )}

                  {(formData.discountType === 'fixed_amount' || formData.discountType === 'fixed_price') && (
                    <div className="col-md-6">
                      <label className="form-label">Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                        placeholder="e.g., 50"
                      />
                    </div>
                  )}
                </div>

                {formData.discountType === 'qty_break' && (
                  <div className="mb-3">
                    <label className="form-label">Quantity Breaks</label>
                    <div className="alert alert-info small">
                      Example: 10+ qty = 5% off, 50+ qty = 10% off
                    </div>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder='[{"min_qty": 10, "discount": 5, "discount_type": "percentage"}, {"min_qty": 50, "discount": 10, "discount_type": "percentage"}]'
                      onChange={(e) => {
                        try {
                          const breaks = JSON.parse(e.target.value);
                          setFormData({...formData, qtyBreaks: breaks});
                        } catch {}
                      }}
                    />
                  </div>
                )}

                {formData.discountType === 'cart_total' && (
                  <div className="mb-3">
                    <label className="form-label">Minimum Cart Amount ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minCartAmount}
                      onChange={(e) => setFormData({...formData, minCartAmount: parseFloat(e.target.value)})}
                      placeholder="e.g., 1000"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Priority (higher = first)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-label-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreate}
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, ruleId: null })}
        onConfirm={handleDelete}
        title="Pricing Rule Sil"
        message="Bu pricing rule'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="İptal"
        type="danger"
      />

      {/* Result Modal */}
      <Modal
        show={resultModal.show}
        onClose={() => setResultModal({ ...resultModal, show: false })}
        onConfirm={() => setResultModal({ ...resultModal, show: false })}
        title={resultModal.type === 'success' ? 'Başarılı' : 'Hata'}
        message={resultModal.message}
        confirmText="Tamam"
        type={resultModal.type === 'success' ? 'success' : 'danger'}
      />
    </div>
  );
}
