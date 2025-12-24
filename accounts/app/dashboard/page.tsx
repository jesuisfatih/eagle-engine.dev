'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import Link from 'next/link';
import type { Order } from '@eagle/types';

export default function AccountsDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    cartItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      const [ordersData, companyData, cartData] = await Promise.all([
        accountsFetch('/api/v1/orders').then(r => r.json()).catch(() => []),
        accountsFetch(`/api/v1/companies/${companyId}`).then(r => r.json()).catch(() => null),
        accountsFetch('/api/v1/carts/active').then(r => r.json()).catch(() => null),
      ]);
      
      setCompanyName(companyData?.name || 'Company');
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
      
      // Type the orders for proper filtering
      interface OrderData {
        financialStatus: string;
        totalPrice?: string | number;
      }
      
      const orders = Array.isArray(ordersData) ? ordersData as OrderData[] : [];
      const pending = orders.filter(o => o.financialStatus === 'pending').length;
      const completed = orders.filter(o => o.financialStatus === 'paid').length;
      const total = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
      
      setStats({
        pendingOrders: pending,
        completedOrders: completed,
        totalSpent: total,
        cartItems: cartData?.items?.length || 0,
      });
    } catch (err) {
      console.error('Load data error:', err);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Welcome back! 👋</h4>
        <p className="mb-0 text-muted">Your company dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Pending Orders</p>
                  <h4 className="mb-0">{stats.pendingOrders}</h4>
                </div>
                <span className="badge bg-label-warning rounded p-2">
                  <i className="ti ti-clock ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Completed Orders</p>
                  <h4 className="mb-0">{stats.completedOrders}</h4>
                </div>
                <span className="badge bg-label-success rounded p-2">
                  <i className="ti ti-check ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Total Spent</p>
                  <h4 className="mb-0">${stats.totalSpent.toFixed(2)}</h4>
                </div>
                <span className="badge bg-label-primary rounded p-2">
                  <i className="ti ti-currency-dollar ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Cart Items</p>
                  <h4 className="mb-0">{stats.cartItems}</h4>
                </div>
                <span className="badge bg-label-info rounded p-2">
                  <i className="ti ti-shopping-cart ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Link href="/products" className="card bg-primary text-white">
            <div className="card-body">
              <i className="ti ti-shopping-bag ti-lg mb-2"></i>
              <h5 className="text-white mb-1">Browse Products</h5>
              <p className="mb-0 small">View catalog with your exclusive B2B prices</p>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/cart" className="card bg-info text-white">
            <div className="card-body">
              <i className="ti ti-shopping-cart ti-lg mb-2"></i>
              <h5 className="text-white mb-1">View Cart</h5>
              <p className="mb-0 small">Review and checkout your cart</p>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/quotes" className="card bg-warning text-white">
            <div className="card-body">
              <i className="ti ti-file-invoice ti-lg mb-2"></i>
              <h5 className="text-white mb-1">Request Quote</h5>
              <p className="mb-0 small">Get custom pricing for bulk orders</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Recent Orders</h5>
          <Link href="/orders" className="btn btn-sm btn-primary">View All</Link>
        </div>
        <div className="card-body">
          {recentOrders.length === 0 ? (
            <div className="text-center py-4">
              <i className="ti ti-package ti-3x text-muted mb-3"></i>
              <p className="text-muted mb-0">No orders yet. Start shopping!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.shopifyOrderNumber}</td>
                      <td className="small">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="fw-semibold">${order.totalPrice}</td>
                      <td>
                        <span className="badge bg-label-success">{order.financialStatus}</span>
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
