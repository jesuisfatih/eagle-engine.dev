'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/api-client';
import {
  PageHeader,
  PageContent,
  StatsCard,
  DataTable,
  type DataTableColumn,
  StatusBadge,
  showToast
} from '@/components/ui';
import type { OrderWithItems } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/orders');
      const data = await response.json();
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);
      setStats({
        total: orderList.length,
        pending: orderList.filter((o: OrderWithItems) => o.paymentStatus === 'pending').length,
        paid: orderList.filter((o: OrderWithItems) => o.paymentStatus === 'paid').length,
        revenue: orderList.reduce((sum: number, o: OrderWithItems) => sum + Number(o.totalPrice || 0), 0),
      });
    } catch (err) {
      console.error('Load orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = 'Order,Company,Total,Status,Date\n' + orders.map(o =>
      `${o.orderNumber},${o.company?.name || 'N/A'},${o.totalPrice},${o.paymentStatus},${new Date(o.createdAt).toLocaleDateString()}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Orders exported successfully!', 'success');
  };

  const columns: DataTableColumn<OrderWithItems>[] = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      sortable: true,
      render: (order) => (
        <Link href={`/orders/${order.id}`} style={{ fontWeight: 500, color: 'var(--accent-primary)', textDecoration: 'none' }}>
          #{order.orderNumber}
        </Link>
      ),
    },
    { key: 'company', label: 'Company', sortable: true, render: (order) => order.company?.name || 'N/A' },
    { key: 'createdAt', label: 'Date', sortable: true, render: (order) => new Date(order.createdAt).toLocaleDateString() },
    { key: 'totalPrice', label: 'Total', sortable: true, render: (order) => `$${Number(order.totalPrice || 0).toFixed(2)}` },
    {
      key: 'paymentStatus', label: 'Payment', sortable: true,
      render: (order) => <StatusBadge status={order.paymentStatus} colorMap={{ paid: 'success', pending: 'warning', refunded: 'info', failed: 'danger' }} />,
    },
    {
      key: 'fulfillmentStatus', label: 'Fulfillment', sortable: true,
      render: (order) => <StatusBadge status={order.fulfillmentStatus} colorMap={{ fulfilled: 'success', partial: 'warning', unfulfilled: 'secondary' }} />,
    },
  ];

  const rowActions = (order: OrderWithItems) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <Link href={`/orders/${order.id}`} className="btn-apple ghost small" style={{ textDecoration: 'none' }}>
        <i className="ti ti-eye" />
      </Link>
      {order.shopifyOrderId && (
        <a href={`https://admin.shopify.com/store/eagledtfsupply/orders/${order.shopifyOrderId}`}
          target="_blank" rel="noopener noreferrer" className="btn-apple ghost small" title="View in Shopify">
          <i className="ti ti-external-link" />
        </a>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        actions={[
          { label: 'Export CSV', icon: 'download', variant: 'success', onClick: exportCSV },
          { label: 'Refresh', icon: 'refresh', variant: 'secondary', onClick: loadOrders },
        ]}
      />

      <div className="stats-grid">
        <StatsCard title="Total Orders" value={stats.total} icon="shopping-cart" iconColor="primary" loading={loading} />
        <StatsCard title="Pending" value={stats.pending} icon="clock" iconColor="warning" loading={loading} />
        <StatsCard title="Paid" value={stats.paid} icon="check" iconColor="success" loading={loading} />
        <StatsCard title="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon="currency-dollar" iconColor="info" loading={loading} />
      </div>

      <div style={{ marginTop: 20 }}>
        <PageContent
          loading={loading}
          empty={{ show: !loading && orders.length === 0, icon: 'shopping-cart', title: 'No orders yet', message: 'Orders will appear here after customers make purchases.' }}
        >
          <DataTable
            data={orders}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search orders..."
            searchFields={['orderNumber', 'company.name']}
            statusFilter={{
              field: 'paymentStatus',
              options: [
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'failed', label: 'Failed' },
              ],
            }}
            defaultSortKey="createdAt"
            defaultSortOrder="desc"
            rowActions={rowActions}
            onRowClick={(order) => window.location.href = `/orders/${order.id}`}
          />
        </PageContent>
      </div>
    </div>
  );
}
