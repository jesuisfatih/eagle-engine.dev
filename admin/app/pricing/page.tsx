'use client';

import Modal from '@/components/Modal';
import { PageHeader, showToast } from '@/components/ui';
import { adminFetch } from '@/lib/api-client';
import { useCallback, useEffect, useState } from 'react';

interface PricingRule {
  id: string;
  name: string;
  type: string;
  value: number;
  companyId?: string;
  companyName?: string;
  productId?: string;
  productTitle?: string;
  minQuantity?: number;
  maxQuantity?: number;
  isActive: boolean;
  createdAt: string;
}

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean; rule: PricingRule | null}>({show: false, rule: null});
  const [form, setForm] = useState({ name: '', type: 'percentage', value: 0, companyId: '', productId: '', minQuantity: 1, maxQuantity: 0 });
  const [saving, setSaving] = useState(false);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/v1/pricing/rules');
      if (res.ok) { const d = await res.json(); setRules(d.rules || d.data || d || []); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch('/api/v1/pricing/rules', { method: 'POST', body: JSON.stringify(form) });
      if (res.ok) { showToast('Rule created!', 'success'); setShowCreate(false); setForm({ name: '', type: 'percentage', value: 0, companyId: '', productId: '', minQuantity: 1, maxQuantity: 0 }); loadRules(); }
      else showToast('Failed to create rule', 'danger');
    } catch { showToast('Error', 'danger'); }
    finally { setSaving(false); }
  };

  const deleteRule = async (rule: PricingRule) => {
    setDeleteModal({show: false, rule: null});
    try {
      const res = await adminFetch(`/api/v1/pricing/rules/${rule.id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Rule deleted', 'success'); loadRules(); }
      else showToast('Failed', 'danger');
    } catch { showToast('Error', 'danger'); }
  };

  const toggleActive = async (rule: PricingRule) => {
    try {
      const res = await adminFetch(`/api/v1/pricing/rules/${rule.id}/toggle`, { method: 'PUT', body: JSON.stringify({ isActive: !rule.isActive }) });
      if (res.ok) loadRules();
    } catch { /* silent */ }
  };

  const filtered = rules.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Pricing Rules" subtitle={`${rules.length} pricing rules`}
        actions={[{ label: 'Add Rule', icon: 'plus', variant: 'primary', onClick: () => setShowCreate(true) }]} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="input-apple" style={{ flex: 1, maxWidth: 360 }}>
          <i className="ti ti-search input-icon" />
          <input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="apple-card">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><i className="ti ti-loader-2 spin" style={{ fontSize: 24, color: 'var(--accent-primary)' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div className="empty-state-icon"><i className="ti ti-discount" /></div>
            <h4 className="empty-state-title">No pricing rules</h4>
            <p className="empty-state-desc">Create rules to offer custom pricing to companies.</p>
          </div>
        ) : (
          <table className="apple-table">
            <thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Company</th><th>Product</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td><span className="badge-apple info">{r.type}</span></td>
                  <td>{r.type === 'percentage' ? `${r.value}%` : `$${r.value}`}</td>
                  <td>{r.companyName || 'All'}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.productTitle || 'All'}</td>
                  <td>
                    <label className="apple-toggle">
                      <input type="checkbox" checked={r.isActive} onChange={() => toggleActive(r)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <button className="btn-apple danger small" onClick={() => setDeleteModal({show: true, rule: r})}><i className="ti ti-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="apple-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="apple-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="apple-modal-header"><h3 className="apple-modal-title">New Pricing Rule</h3></div>
            <form onSubmit={handleCreate}>
              <div className="apple-modal-body">
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Rule Name</label>
                  <div className="input-apple"><input placeholder="e.g. VIP 10% discount" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="input-label">Type</label>
                    <div className="select-apple">
                      <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="override">Price Override</option>
                      </select>
                      <i className="ti ti-chevron-down select-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Value</label>
                    <div className="input-apple"><input type="number" min={0} value={form.value} onChange={e => setForm(p => ({...p, value: +e.target.value}))} required /></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Min Quantity</label>
                    <div className="input-apple"><input type="number" min={1} value={form.minQuantity} onChange={e => setForm(p => ({...p, minQuantity: +e.target.value}))} /></div>
                  </div>
                  <div>
                    <label className="input-label">Max Quantity</label>
                    <div className="input-apple"><input type="number" min={0} placeholder="0 = unlimited" value={form.maxQuantity} onChange={e => setForm(p => ({...p, maxQuantity: +e.target.value}))} /></div>
                  </div>
                </div>
              </div>
              <div className="apple-modal-footer">
                <button type="button" className="btn-apple secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-apple primary" disabled={saving}>{saving ? 'Creating...' : 'Create Rule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.show && deleteModal.rule && (
        <Modal show onClose={() => setDeleteModal({show: false, rule: null})} onConfirm={() => deleteRule(deleteModal.rule!)}
          title="Delete Rule" message={`Delete "${deleteModal.rule.name}"?`} confirmText="Delete" type="danger" />
      )}
    </div>
  );
}
