'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

interface Address {
  id: string;
  type: 'BILLING' | 'SHIPPING';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface AddressFormData {
  type: 'BILLING' | 'SHIPPING';
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const emptyFormData: AddressFormData = {
  type: 'SHIPPING',
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  phone: '',
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean; id: string}>({show: false, id: ''});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});
  const [formModal, setFormModal] = useState<{show: boolean; editId: string | null}>({show: false, editId: null});
  const [formData, setFormData] = useState<AddressFormData>(emptyFormData);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await accountsFetch('/api/v1/addresses');
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(emptyFormData);
    setFormModal({show: true, editId: null});
  };

  const openEditModal = (address: Address) => {
    setFormData({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    });
    setFormModal({show: true, editId: address.id});
  };

  const handleFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = formModal.editId 
        ? `/api/v1/addresses/${formModal.editId}`
        : '/api/v1/addresses';
      
      const method = formModal.editId ? 'PUT' : 'POST';
      
      const response = await accountsFetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      
      setFormModal({show: false, editId: null});
      
      if (response.ok) {
        setResultModal({show: true, message: formModal.editId ? '✅ Address updated successfully!' : '✅ Address added successfully!'});
        loadAddresses();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to save address'}`});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to save address'});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await accountsFetch(`/api/v1/addresses/${id}`, {
        method: 'DELETE',
      });
      
      setDeleteModal({show: false, id: ''});
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Address deleted successfully!'});
        loadAddresses();
      } else {
        setResultModal({show: true, message: '❌ Failed to delete address'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to delete address'});
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const response = await accountsFetch(`/api/v1/addresses/${id}/default`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Default address updated!'});
        loadAddresses();
      } else {
        setResultModal({show: true, message: '❌ Failed to set default address'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to set default address'});
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Saved Addresses</h4>
        <button onClick={openAddModal} className="btn btn-primary">
          <i className="ti ti-plus me-1"></i>
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-map-pin fs-1 text-muted mb-3 d-block"></i>
            <h5>No addresses saved</h5>
            <p className="text-muted mb-3">Add your first shipping or billing address</p>
            <button onClick={openAddModal} className="btn btn-primary">
              Add Address
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {addresses.map((address) => (
            <div key={address.id} className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="mb-0">{address.type === 'BILLING' ? 'Billing' : 'Shipping'} Address</h6>
                    {address.isDefault && (
                      <span className="badge bg-label-primary">Default</span>
                    )}
                  </div>
                  <p className="mb-1 fw-semibold">{address.firstName} {address.lastName}</p>
                  {address.company && <p className="mb-1 small">{address.company}</p>}
                  <p className="mb-1 small text-muted">{address.address1}</p>
                  {address.address2 && <p className="mb-1 small text-muted">{address.address2}</p>}
                  <p className="mb-1 small text-muted">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="mb-1 small text-muted">{address.country}</p>
                  {address.phone && <p className="mb-0 small text-muted">{address.phone}</p>}
                  
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(address)}
                      className="btn btn-sm btn-label-secondary"
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => setAsDefault(address.id)}
                        className="btn btn-sm btn-label-primary"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal({show: true, id: address.id})}
                      className="btn btn-sm btn-text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {formModal.show && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {formModal.editId ? 'Edit Address' : 'Add New Address'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setFormModal({show: false, editId: null})}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Address Type</label>
                    <select 
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => handleFormChange('type', e.target.value as 'BILLING' | 'SHIPPING')}
                    >
                      <option value="SHIPPING">Shipping</option>
                      <option value="BILLING">Billing</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isDefault">
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Company (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address Line 1 *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.address1}
                      onChange={(e) => handleFormChange('address1', e.target.value)}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address Line 2</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.address2}
                      onChange={(e) => handleFormChange('address2', e.target.value)}
                      placeholder="Apt, suite, unit, etc."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">State *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">ZIP Code *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.postalCode}
                      onChange={(e) => handleFormChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setFormModal({show: false, editId: null})}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.state || !formData.postalCode || !formData.country}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    formModal.editId ? 'Update Address' : 'Save Address'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <Modal
          show={deleteModal.show}
          onClose={() => setDeleteModal({show: false, id: ''})}
          onConfirm={() => handleDelete(deleteModal.id)}
          title="Delete Address"
          message="Are you sure you want to delete this address? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: ''})}
          onConfirm={() => setResultModal({show: false, message: ''})}
          title={resultModal.message.includes('✅') ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.message.includes('✅') ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

