'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OrderTracking from '../components/OrderTracking';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/orders/${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-4">
        <Link href="/orders" className="text-primary">
          <i className="ti ti-arrow-left me-1"></i>Back to Orders
        </Link>
      </nav>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Order #{order.shopifyOrderNumber}</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Order Date</p>
                  <p className="fw-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Status</p>
                  <span className="badge bg-label-success">{order.financialStatus}</span>
                </div>
              </div>

              <h6 className="mb-3">Items</h6>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price}</td>
                        <td className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Order Summary</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span className="fw-semibold">${order.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span className="fw-semibold">${order.totalTax}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Discounts</span>
                <span className="text-success fw-semibold">-${order.totalDiscounts}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total</span>
                <h4 className="text-primary mb-0">${order.totalPrice}</h4>
              </div>

              <button className="btn btn-primary w-100 mt-3">
                <i className="ti ti-refresh me-1"></i>
                Reorder
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="btn btn-label-secondary w-100 mt-2"
              >
                <i className="ti ti-printer me-1"></i>
                Print Invoice
              </button>
            </div>
          </div>

          <OrderTracking order={order} />
        </div>
      </div>
    </div>
  );
}

