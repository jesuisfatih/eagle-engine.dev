'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [convertModal, setConvertModal] = useState<{show: boolean; customerId: string}>({show: false, customerId: ''});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [syncing, setSyncing] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/shopify-customers');
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err) {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      await adminFetch('/api/v1/sync/customers', { method: 'POST' });
      setResultModal({show: true, message: '✅ Customers sync started! Data will refresh in a moment.', type: 'success'});
      setTimeout(loadCustomers, 3000);
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to start sync', type: 'error'});
    } finally {
      setSyncing(false);
    }
  };

  const convertToCompany = async (customerId: string) => {
    try {
      setConverting(true);
      setConvertModal({show: false, customerId: ''});
      
      const response = await adminFetch(`/api/v1/shopify-customers/${customerId}/convert-to-company`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Customer converted to B2B company! Invitation email sent.', type: 'success'});
        loadCustomers();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to convert customer'}`, type: 'error'});
      }
    } catch (err: any) {
      setResultModal({show: true, message: `❌ ${err.message || 'Failed to convert customer'}`, type: 'error'});
    } finally {
      setConverting(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(query) ||
      c.lastName?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Customers</h4>
          <p className="mb-0 text-muted">{filteredCustomers.length} of {customers.length} customers</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search customers..."
            style={{maxWidth: '250px'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={syncCustomers}
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
                <i className="ti ti-refresh me-1"></i>Sync
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-users fs-1 text-muted mb-3 d-block"></i>
              <h5>No customers found</h5>
              <p className="text-muted">
                {searchQuery ? 'Try a different search term' : 'Sync customers from Shopify to see them here'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-semibold">{customer.firstName} {customer.lastName}</td>
                      <td>{customer.email}</td>
                      <td className="small">{customer.phone || '-'}</td>
                      <td>{customer.ordersCount || 0}</td>
                      <td className="fw-semibold">${parseFloat(customer.totalSpent || 0).toFixed(2)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <a 
                            href={`mailto:${customer.email}`} 
                            className="btn btn-sm btn-label-primary"
                            title="Send Email"
                          >
                            <i className="ti ti-mail"></i>
                          </a>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setConvertModal({show: true, customerId: customer.id})}
                            disabled={converting}
                            title="Convert to B2B Company"
                          >
                            <i className="ti ti-building me-1"></i>
                            Convert to B2B
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {convertModal.show && (
        <Modal
          show={convertModal.show}
          onClose={() => setConvertModal({show: false, customerId: ''})}
          onConfirm={() => convertToCompany(convertModal.customerId)}
          title="Convert to B2B Company"
          message="Are you sure you want to convert this customer to a B2B company? An invitation email will be sent to the customer."
          confirmText="Convert"
          cancelText="Cancel"
          type="warning"
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

