'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/api-client';
import type { OrderWithItems, OrderLineItem } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const response = await adminFetch(`/api/v1/orders/${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) return <div className="spinner-border"></div>;

  return (
    <div>
      <nav className="mb-4">
        <Link href="/orders">← Back to Orders</Link>
      </nav>

      <div className="card">
        <div className="card-header">
          <h5>Order #{order.shopifyOrderNumber}</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Company:</strong> {order.company?.name || 'N/A'}</p>
              <p><strong>Customer:</strong> {order.companyUser?.email}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Total:</strong> ${order.totalPrice}</p>
              <p><strong>Status:</strong> <span className="badge bg-label-success">{order.financialStatus}</span></p>
            </div>
          </div>

          <h6 className="mt-4">Items:</h6>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.lineItems?.map((item, i) => (
                <tr key={i}>
                  <td>{item.title}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

