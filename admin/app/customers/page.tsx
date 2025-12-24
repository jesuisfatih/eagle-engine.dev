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
  const [stats, setStats] = useState({
    total: 0,
    withOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/shopify-customers');
      const data = await response.json();
      const customerList = Array.isArray(data) ? data : data.customers || [];
      setCustomers(customerList);
      
      // Calculate stats
      const withOrders = customerList.filter((c: ShopifyCustomerAdmin) => (c.ordersCount || 0) > 0).length;
      const totalSpent = customerList.reduce((sum: number, c: ShopifyCustomerAdmin) => 
        sum + parseFloat(c.totalSpent || '0'), 0);
      
      setStats({
        total: customerList.length,
        withOrders,
        totalSpent,
      });
    } catch (err) {
      console.error('Load customers error:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      await adminFetch('/api/v1/sync/customers', { method: 'POST' });
      showToast('success', 'Customers sync started! Data will refresh in a moment.');
      setTimeout(loadCustomers, 3000);
    } catch (err) {
      showToast('error', 'Failed to start sync');
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
        showToast('success', 'Customer converted to B2B company! Invitation email sent.');
        loadCustomers();
      } else {
        const error = await response.json().catch(() => ({}));
        showToast('error', error.message || 'Failed to convert customer');
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to convert customer');
    } finally {
      setConverting(false);
    }
  };

  // Table columns
  const columns: DataTableColumn<ShopifyCustomerAdmin>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (customer) => (
        <div>
          <span className="fw-semibold">{customer.firstName} {customer.lastName}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      className: 'small',
      render: (customer) => customer.phone || '-',
    },
    {
      key: 'ordersCount',
      label: 'Orders',
      sortable: true,
      render: (customer) => customer.ordersCount || 0,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      className: 'fw-semibold',
      render: (customer) => `$${parseFloat(customer.totalSpent || '0').toFixed(2)}`,
    },
  ];

  // Row actions
  const rowActions = (customer: ShopifyCustomerAdmin) => (
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
  );

  return (
    <div>
      <PageHeader
        title="All Customers"
        subtitle={`${customers.length} customers from Shopify`}
        actions={[
          {
            label: syncing ? 'Syncing...' : 'Sync Customers',
            icon: 'refresh',
            variant: 'primary',
            onClick: syncCustomers,
            disabled: syncing,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-4">
          <StatsCard
            title="Total Customers"
            value={stats.total}
            icon="users"
            iconColor="primary"
            loading={loading}
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <StatsCard
            title="With Orders"
            value={stats.withOrders}
            icon="shopping-cart"
            iconColor="success"
            loading={loading}
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toFixed(2)}`}
            icon="currency-dollar"
            iconColor="info"
            loading={loading}
          />
        </div>
      </div>

      {/* Customers Table */}
      <PageContent
        loading={loading}
        empty={{
          show: !loading && customers.length === 0,
          icon: 'users',
          title: 'No customers synced',
          message: 'Click "Sync Customers" to import from Shopify.',
        }}
      >
        <DataTable
          data={customers}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search customers..."
          searchFields={['firstName', 'lastName', 'email', 'phone']}
          defaultSortKey="totalSpent"
          defaultSortOrder="desc"
          rowActions={rowActions}
          emptyIcon="users"
          emptyTitle="No customers found"
          emptyMessage="Try adjusting your search criteria."
        />
      </PageContent>

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
    </div>
  );
}

