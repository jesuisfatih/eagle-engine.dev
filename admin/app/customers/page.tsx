'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';
import {
  PageHeader,
  PageContent,
  StatsCard,
  DataTable,
  type DataTableColumn,
  showToast
} from '@/components/ui';
import type { ShopifyCustomerAdmin } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ShopifyCustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertModal, setConvertModal] = useState<{show: boolean; customerId: string}>({show: false, customerId: ''});
  const [syncing, setSyncing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [stats, setStats] = useState({ total: 0, withOrders: 0, totalSpent: 0 });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/shopify-customers');
      const data = await response.json();
      const customerList = Array.isArray(data) ? data : data.customers || [];
      setCustomers(customerList);
      const withOrders = customerList.filter((c: ShopifyCustomerAdmin) => (c.ordersCount || 0) > 0).length;
      const totalSpent = customerList.reduce((sum: number, c: ShopifyCustomerAdmin) => sum + parseFloat(c.totalSpent || '0'), 0);
      setStats({ total: customerList.length, withOrders, totalSpent });
    } catch (err) {
      console.error('Load customers error:', err);
      setCustomers([]);
    } finally { setLoading(false); }
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      await adminFetch('/api/v1/sync/customers', { method: 'POST' });
      showToast('Customers sync started!', 'success');
      setTimeout(loadCustomers, 3000);
    } catch { showToast('Failed to start sync', 'danger'); }
    finally { setSyncing(false); }
  };

  const convertToCompany = async (customerId: string) => {
    try {
      setConverting(true);
      setConvertModal({show: false, customerId: ''});
      const response = await adminFetch(`/api/v1/shopify-customers/${customerId}/convert-to-company`, { method: 'POST' });
      if (response.ok) {
        showToast('Customer converted to B2B company!', 'success');
        loadCustomers();
      } else {
        const error = await response.json().catch(() => ({}));
        showToast(error.message || 'Failed to convert customer', 'danger');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to convert', 'danger');
    } finally { setConverting(false); }
  };

  const columns: DataTableColumn<ShopifyCustomerAdmin>[] = [
    { key: 'name', label: 'Customer', sortable: true, render: (c) => <span style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', render: (c) => c.phone || '-' },
    { key: 'ordersCount', label: 'Orders', sortable: true, render: (c) => c.ordersCount || 0 },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (c) => `$${parseFloat(c.totalSpent || '0').toFixed(2)}` },
  ];

  const rowActions = (customer: ShopifyCustomerAdmin) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <a href={`mailto:${customer.email}`} className="btn-apple ghost small" title="Send Email">
        <i className="ti ti-mail" />
      </a>
      <button className="btn-apple primary small" onClick={() => setConvertModal({show: true, customerId: customer.id})} disabled={converting}>
        <i className="ti ti-building" /> Convert
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="All Customers"
        subtitle={`${customers.length} customers from Shopify`}
        actions={[{ label: syncing ? 'Syncing...' : 'Sync Customers', icon: 'refresh', variant: 'primary', onClick: syncCustomers, disabled: syncing }]}
      />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatsCard title="Total Customers" value={stats.total} icon="users" iconColor="primary" loading={loading} />
        <StatsCard title="With Orders" value={stats.withOrders} icon="shopping-cart" iconColor="success" loading={loading} />
        <StatsCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon="currency-dollar" iconColor="info" loading={loading} />
      </div>

      <div style={{ marginTop: 20 }}>
        <PageContent loading={loading} empty={{ show: !loading && customers.length === 0, icon: 'users', title: 'No customers synced', message: 'Click "Sync Customers" to import from Shopify.' }}>
          <DataTable data={customers} columns={columns} loading={loading} searchable searchPlaceholder="Search customers..." searchFields={['firstName', 'lastName', 'email', 'phone']} defaultSortKey="totalSpent" defaultSortOrder="desc" rowActions={rowActions} />
        </PageContent>
      </div>

      {convertModal.show && (
        <Modal show={convertModal.show} onClose={() => setConvertModal({show: false, customerId: ''})} onConfirm={() => convertToCompany(convertModal.customerId)} title="Convert to B2B Company" message="Are you sure you want to convert this customer to a B2B company? An invitation email will be sent." confirmText="Convert" cancelText="Cancel" type="warning" />
      )}
    </div>
  );
}

