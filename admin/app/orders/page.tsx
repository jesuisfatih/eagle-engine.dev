'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiClient.getOrders();
      setOrders(Array.isArray(data) ? data : []);
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];
    
    if (statusFilter) {
      filtered = filtered.filter(o => o.financialStatus === statusFilter);
    }
    
    if (companyFilter) {
      filtered = filtered.filter(o => o.companyId === companyFilter);
    }
    
    setOrders(filtered);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Orders</h4>
          <p className="mb-0 text-muted">Manage all B2B orders</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => {
              const csv = 'Order,Company,Total,Status\n' + orders.map(o => 
                `${o.shopifyOrderNumber},${o.company?.name || 'N/A'},${o.totalPrice},${o.financialStatus}`
              ).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'orders.csv';
              a.click();
            }}
            className="btn btn-success"
          >
            <i className="ti ti-download me-1"></i>Export CSV
          </button>
          <select
            className="form-select"
            style={{width: '150px'}}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setTimeout(applyFilters, 100);
            }}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <button onClick={() => {
            setStatusFilter('');
            setCompanyFilter('');
            setOrders(allOrders);
          }} className="btn btn-sm btn-label-secondary">
            <i className="ti ti-x me-1"></i>Clear
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
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-shopping-cart ti-3x text-muted mb-3"></i>
              <h5>No orders yet</h5>
              <p className="text-muted">Orders will appear here after customers make purchases</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.shopifyOrderNumber}</td>
                      <td>{order.company?.name || 'N/A'}</td>
                      <td className="small">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="fw-semibold">${order.totalPrice}</td>
                      <td>
                        <span className="badge bg-label-success">
                          {order.financialStatus}
                        </span>
                      </td>
                      <td>
                        <a href={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                          <i className="ti ti-eye me-1"></i>
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
