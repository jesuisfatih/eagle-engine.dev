'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function PricingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetType: 'all',
    scopeType: 'all',
    discountType: 'percentage',
    discountPercentage: 0,
    priority: 0,
    isActive: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

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
      alert('✅ Pricing rule created!');
      setShowCreateModal(false);
      loadRules();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing rule?')) return;
    try {
      await apiClient.deletePricingRule(id);
      alert('✅ Rule deleted!');
      loadRules();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
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
                          onClick={() => handleDelete(rule.id)}
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
                    <label className="form-label">Target</label>
                    <select
                      className="form-select"
                      value={formData.targetType}
                      onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                    >
                      <option value="all">All Companies</option>
                      <option value="company">Specific Company</option>
                      <option value="company_group">Company Group</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount ($)</option>
                      <option value="fixed_price">Fixed Price</option>
                      <option value="qty_break">Quantity Breaks</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Discount Value (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})}
                    placeholder="e.g., 25"
                  />
                </div>

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
    </div>
  );
}
