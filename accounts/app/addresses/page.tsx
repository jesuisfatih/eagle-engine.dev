'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

// Backend uses isBilling/isShipping booleans, not type enum
interface Address {
  id: string;
  isBilling: boolean;
  isShipping: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  label?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  provinceCode?: string;
  zip: string;
  country: string;
  countryCode?: string;
  phone?: string;
  isDefault: boolean;
}

// Computed type from booleans
type AddressType = 'BILLING' | 'SHIPPING' | 'BOTH';

function getAddressType(addr: Address): AddressType {
  if (addr.isBilling && addr.isShipping) return 'BOTH';
  if (addr.isBilling) return 'BILLING';
  return 'SHIPPING';
}

interface AddressFormData {
  type: AddressType;
  firstName: string;
  lastName: string;
  company: string;
  label: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  countryCode: string;
  phone: string;
  isDefault: boolean;
}

const emptyFormData: AddressFormData = {
  type: 'SHIPPING',
  firstName: '',
  lastName: '',
  company: '',
  label: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  zip: '',
  country: 'United States',
  countryCode: 'US',
  phone: '',
  isDefault: false,
};

type AddressFilter = 'all' | 'shipping' | 'billing';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<AddressFilter>('all');
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean; id: string}>({show: false, id: ''});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
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

  // Stats
  const stats = useMemo(() => {
    const shipping = addresses.filter(a => a.isShipping);
    const billing = addresses.filter(a => a.isBilling);
    const defaultShipping = addresses.find(a => a.isShipping && a.isDefault);
    const defaultBilling = addresses.find(a => a.isBilling && a.isDefault);
    
    return {
      total: addresses.length,
      shipping: shipping.length,
      billing: billing.length,
      hasDefaultShipping: !!defaultShipping,
      hasDefaultBilling: !!defaultBilling,
    };
  }, [addresses]);

  // Filtered addresses
  const filteredAddresses = useMemo(() => {
    if (filter === 'all') return addresses;
    if (filter === 'shipping') return addresses.filter(a => a.isShipping);
    if (filter === 'billing') return addresses.filter(a => a.isBilling);
    return addresses;
  }, [addresses, filter]);

  const openAddModal = (type?: AddressType) => {
    setFormData({...emptyFormData, type: type || 'SHIPPING'});
    setFormModal({show: true, editId: null});
  };

  const openEditModal = (address: Address) => {
    setFormData({
      type: getAddressType(address),
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      label: address.label || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      province: address.province || '',
      zip: address.zip,
      country: address.country,
      countryCode: address.countryCode || 'US',
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
      
      // Convert type to isBilling/isShipping for backend
      const { type, ...restFormData } = formData;
      const payload = {
        ...restFormData,
        isBilling: type === 'BILLING' || type === 'BOTH',
        isShipping: type === 'SHIPPING' || type === 'BOTH',
      };
      
      const response = await accountsFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      
      setFormModal({show: false, editId: null});
      
      if (response.ok) {
        setResultModal({
          show: true, 
          message: formModal.editId ? 'Address updated successfully!' : 'Address added successfully!',
          type: 'success'
        });
        loadAddresses();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: error.message || 'Failed to save address', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to save address', type: 'error'});
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
        setResultModal({show: true, message: 'Address deleted successfully!', type: 'success'});
        loadAddresses();
      } else {
        setResultModal({show: true, message: 'Failed to delete address', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to delete address', type: 'error'});
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const response = await accountsFetch(`/api/v1/addresses/${id}/default`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setResultModal({show: true, message: 'Default address updated!', type: 'success'});
        loadAddresses();
      } else {
        setResultModal({show: true, message: 'Failed to set default address', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to set default address', type: 'error'});
    }
  };

  const copyToClipboard = (address: Address) => {
    const text = [
      `${address.firstName} ${address.lastName}`,
      address.company,
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
      address.country,
      address.phone,
    ].filter(Boolean).join('\n');
    
    navigator.clipboard.writeText(text);
    setResultModal({show: true, message: 'Address copied to clipboard!', type: 'success'});
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="ti ti-map-pin text-primary me-2"></i>
            Saved Addresses
          </h4>
          <p className="text-muted mb-0">Manage your shipping and billing addresses</p>
        </div>
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
            <i className="ti ti-plus me-1"></i>
            Add Address
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={() => openAddModal('SHIPPING')}>
                <i className="ti ti-truck me-2"></i>Shipping Address
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => openAddModal('BILLING')}>
                <i className="ti ti-file-invoice me-2"></i>Billing Address
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-primary rounded">
                  <i className="ti ti-map-pin ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                  <small className="text-muted">Total Addresses</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-info rounded">
                  <i className="ti ti-truck ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.shipping}</h3>
                  <small className="text-muted">Shipping</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-warning rounded">
                  <i className="ti ti-file-invoice ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.billing}</h3>
                  <small className="text-muted">Billing</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar ${stats.hasDefaultShipping && stats.hasDefaultBilling ? 'bg-label-success' : 'bg-label-danger'} rounded`}>
                  <i className="ti ti-star ti-md"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">
                    {stats.hasDefaultShipping && stats.hasDefaultBilling ? 'Complete' : 'Incomplete'}
                  </h6>
                  <small className="text-muted">Default Setup</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Defaults Warning */}
      {(!stats.hasDefaultShipping || !stats.hasDefaultBilling) && addresses.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-3 mb-4">
          <i className="ti ti-alert-triangle ti-lg"></i>
          <div>
            <strong>Default addresses not set</strong>
            <p className="mb-0 small">
              {!stats.hasDefaultShipping && 'Set a default shipping address for faster checkout. '}
              {!stats.hasDefaultBilling && 'Set a default billing address for invoicing.'}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {addresses.length > 0 && (
        <div className="card mb-4">
          <div className="card-body py-3">
            <div className="btn-group">
              {[
                { key: 'all' as AddressFilter, label: 'All', icon: 'list', count: addresses.length },
                { key: 'shipping' as AddressFilter, label: 'Shipping', icon: 'truck', count: stats.shipping },
                { key: 'billing' as AddressFilter, label: 'Billing', icon: 'file-invoice', count: stats.billing },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  <i className={`ti ti-${tab.icon} me-1`}></i>
                  {tab.label}
                  <span className="badge bg-white text-primary ms-1">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="avatar avatar-xl bg-label-primary rounded-circle mx-auto mb-3">
              <i className="ti ti-map-pin ti-xl"></i>
            </div>
            <h5>No addresses saved</h5>
            <p className="text-muted mb-4">Add shipping and billing addresses for faster checkout</p>
            <div className="d-flex justify-content-center gap-2">
              <button onClick={() => openAddModal('SHIPPING')} className="btn btn-primary">
                <i className="ti ti-truck me-1"></i>Add Shipping Address
              </button>
              <button onClick={() => openAddModal('BILLING')} className="btn btn-outline-primary">
                <i className="ti ti-file-invoice me-1"></i>Add Billing Address
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredAddresses.map((address) => (
            <div key={address.id} className="col-md-6 col-xl-4">
              <div className={`card h-100 ${address.isDefault ? 'border-primary' : ''}`}>
                <div className="card-header d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className={`avatar avatar-sm ${address.type === 'SHIPPING' ? 'bg-label-info' : 'bg-label-warning'} rounded`}>
                      <i className={`ti ti-${address.type === 'SHIPPING' ? 'truck' : 'file-invoice'}`}></i>
                    </div>
                    <span className="fw-semibold">
                      {address.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    {address.isDefault && (
                      <span className="badge bg-primary">
                        <i className="ti ti-star-filled me-1"></i>Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <h6 className="mb-2">{address.firstName} {address.lastName}</h6>
                  {address.company && (
                    <p className="mb-1 small text-primary">
                      <i className="ti ti-building me-1"></i>{address.company}
                    </p>
                  )}
                  <p className="mb-1 small text-muted">
                    <i className="ti ti-map-pin me-1"></i>{address.address1}
                  </p>
                  {address.address2 && (
                    <p className="mb-1 small text-muted ps-4">{address.address2}</p>
                  )}
                  <p className="mb-1 small text-muted ps-4">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="mb-1 small text-muted ps-4">{address.country}</p>
                  {address.phone && (
                    <p className="mb-0 small text-muted">
                      <i className="ti ti-phone me-1"></i>{address.phone}
                    </p>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(address)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="ti ti-edit me-1"></i>Edit
                    </button>
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="btn btn-sm btn-outline-secondary"
                      title="Copy to clipboard"
                    >
                      <i className="ti ti-copy"></i>
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => setAsDefault(address.id)}
                        className="btn btn-sm btn-outline-success"
                        title="Set as default"
                      >
                        <i className="ti ti-star me-1"></i>Default
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal({show: true, id: address.id})}
                      className="btn btn-sm btn-outline-danger ms-auto"
                      title="Delete"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div className="col-md-6 col-xl-4">
            <div 
              className="card h-100 border-dashed bg-light cursor-pointer" 
              onClick={() => openAddModal()}
              style={{ cursor: 'pointer', minHeight: 200 }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div className="avatar avatar-lg bg-label-primary rounded-circle mb-3">
                  <i className="ti ti-plus ti-lg"></i>
                </div>
                <h6 className="mb-1">Add New Address</h6>
                <p className="text-muted small mb-0">Shipping or billing</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {formModal.show && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${formModal.editId ? 'edit' : 'plus'} me-2`}></i>
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
                  {/* Address Type Selection */}
                  <div className="col-12">
                    <label className="form-label">Address Type</label>
                    <div className="btn-group w-100">
                      <button
                        type="button"
                        className={`btn ${formData.type === 'SHIPPING' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleFormChange('type', 'SHIPPING')}
                      >
                        <i className="ti ti-truck me-1"></i>Shipping
                      </button>
                      <button
                        type="button"
                        className={`btn ${formData.type === 'BILLING' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleFormChange('type', 'BILLING')}
                      >
                        <i className="ti ti-file-invoice me-1"></i>Billing
                      </button>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isDefault">
                        <i className="ti ti-star me-1 text-warning"></i>
                        Set as default {formData.type.toLowerCase()} address
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      <i className="ti ti-building me-1"></i>Company (Optional)
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address Line 1 <span className="text-danger">*</span></label>
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
                      placeholder="Apt, suite, unit, building, floor, etc."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">State <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      placeholder="TX"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">ZIP Code <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.postalCode}
                      onChange={(e) => handleFormChange('postalCode', e.target.value)}
                      placeholder="75001"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="ti ti-phone me-1"></i>Phone (Optional)
                    </label>
                    <input 
                      type="tel" 
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
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
                    <>
                      <i className={`ti ti-${formModal.editId ? 'device-floppy' : 'plus'} me-1`}></i>
                      {formModal.editId ? 'Update Address' : 'Save Address'}
                    </>
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

