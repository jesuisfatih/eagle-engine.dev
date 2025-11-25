'use client';

import { useState, useEffect } from 'react';

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
      <h4 className="fw-bold mb-4">All Customers</h4>

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
    </div>
  );
}

