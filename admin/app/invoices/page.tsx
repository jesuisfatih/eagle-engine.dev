'use client';

import { PageContent, PageHeader, StatsCard } from '@/components/ui/PageLayout';
import { showToast } from '@/components/ui/Toast';
import { adminFetch } from '@/lib/api-client';
import { useEffect, useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  company: { name: string };
  issueDate: string;
  dueDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await adminFetch('/api/v1/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      showToast('Failed to fetch invoices', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      paid: 'success',
      unpaid: 'warning',
      overdue: 'danger',
      partial: 'info',
    };
    return <span className={`badge-apple ${map[status] || 'secondary'}`}>{status.toUpperCase()}</span>;
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Manage B2B billing and customer invoices"
        actions={[
          { label: 'Create Invoice', icon: 'plus', variant: 'primary', onClick: () => showToast('Create feature coming soon', 'info') }
        ]}
      />

      <div className="grid-3 mb-24">
        <StatsCard title="Total Invoiced" value={`$${invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0).toLocaleString()}`} icon="receipt" iconColor="blue" />
        <StatsCard title="Pending Payments" value={`$${invoices.filter(i => i.status !== 'paid').reduce((acc, inv) => acc + Number(inv.totalAmount - inv.amountPaid), 0).toLocaleString()}`} icon="clock" iconColor="orange" />
        <StatsCard title="Paid Today" value="$0.00" icon="check" iconColor="green" />
      </div>

      <PageContent loading={loading}>
        <div className="apple-card">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Company</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: 40, color: 'var(--text-tertiary)' }}>
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</td>
                    <td>{invoice.company?.name}</td>
                    <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</td>
                    <td style={{ fontWeight: 600 }}>${Number(invoice.totalAmount).toFixed(2)}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>
                      <button className="btn-apple ghost small">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageContent>
    </>
  );
}
