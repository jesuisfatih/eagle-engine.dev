'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/shopify-customers`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setCustomers([]);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Customers</h4>
          <p className="mb-0 text-muted">{customers.length} total customers</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search customers..."
            style={{maxWidth: '250px'}}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              if (query) {
                loadCustomers();
              } else {
                loadCustomers();
              }
            }}
          />
          <button
            onClick={async () => {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
              await fetch(`${API_URL}/api/v1/sync/customers`, { method: 'POST' });
              alert('✅ Customers sync started!');
              setTimeout(loadCustomers, 3000);
            }}
            className="btn btn-primary"
          >
            <i className="ti ti-refresh me-1"></i>Sync
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
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
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="fw-semibold">{customer.firstName} {customer.lastName}</td>
                    <td>{customer.email}</td>
                    <td className="small">{customer.phone}</td>
                    <td>{customer.ordersCount}</td>
                    <td className="fw-semibold">${customer.totalSpent}</td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-primary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href={`mailto:${customer.email}`}>
                              <i className="ti ti-mail me-2"></i>Send Email
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                              onClick={async () => {
                                try {
                                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
                                  await fetch(`${API_URL}/api/v1/shopify-customers/${customer.id}/convert-to-company`, {
                                    method: 'POST',
                                  });
                                  alert('✅ Converted to B2B company!');
                                  loadCustomers();
                                } catch (err) {
                                  alert('❌ Failed');
                                }
                              }}
                            >
                              <i className="ti ti-building me-2"></i>Convert to B2B
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {convertModal.show && (
        <Modal
          show={convertModal.show}
          onClose={() => setConvertModal({show: false, customerId: ''})}
          onConfirm={() => convertToCompany(convertModal.customerId)}
          title="Convert to Company"
          message="Are you sure you want to convert this customer to a company?"
          confirmText="Convert"
          cancelText="Cancel"
          type="warning"
        />
      )}
    </div>
  );
}

