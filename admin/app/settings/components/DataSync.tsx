'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/api-client';
import { showToast } from '@/components/ui';
import type { AdminMerchantSettings } from './types';

interface DataSyncProps {
  settings: AdminMerchantSettings | null;
  onSyncComplete: () => void;
}

export default function DataSync({ settings, onSyncComplete }: DataSyncProps) {
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = async (type: 'customers' | 'products' | 'orders' | 'initial') => {
    setSyncing(type);
    try {
      const endpoint = type === 'initial' ? '/api/v1/sync/initial' : `/api/v1/sync/${type}`;
      const response = await adminFetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        const message = type === 'initial' 
          ? 'Full sync started! This may take a few minutes.' 
          : `${type.charAt(0).toUpperCase() + type.slice(1)} sync started!`;
        showToast('success', message);
        // Reload settings after a delay
        setTimeout(onSyncComplete, 3000);
      } else {
        const err = await response.json();
        showToast('error', err.message || 'Sync failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast('error', `Sync failed: ${message}`);
    } finally {
      setSyncing(null);
    }
  };

  const syncItems = [
    {
      type: 'customers' as const,
      label: 'Customers',
      icon: 'users',
      color: 'primary',
      stats: `${settings?.stats?.syncedCustomers || 0} / ${settings?.stats?.totalCustomers || 0} synced`,
    },
    {
      type: 'products' as const,
      label: 'Products',
      icon: 'package',
      color: 'success',
      stats: `${settings?.stats?.totalProducts || 0} total`,
    },
    {
      type: 'orders' as const,
      label: 'Orders',
      icon: 'shopping-cart',
      color: 'warning',
      stats: `${settings?.stats?.totalOrders || 0} total`,
    },
    {
      type: 'initial' as const,
      label: 'Full Sync',
      icon: 'refresh',
      color: 'danger',
      stats: 'All data',
      highlight: true,
    },
  ];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="ti ti-refresh me-2"></i>
          Data Synchronization
        </h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-3">
          <i className="ti ti-info-circle me-2"></i>
          Auto-sync runs every 5 minutes for customers. Use manual sync for immediate updates.
        </div>

        <div className="row g-3">
          {syncItems.map((item) => (
            <div key={item.type} className="col-md-3">
              <div className={`border rounded p-3 text-center ${item.highlight ? 'bg-light' : ''}`}>
                <i className={`ti ti-${item.icon} ti-lg text-${item.color} mb-2 d-block`}></i>
                <p className="mb-1 fw-semibold">{item.label}</p>
                <p className="mb-2 small text-muted">{item.stats}</p>
                <button
                  onClick={() => handleSync(item.type)}
                  disabled={syncing !== null}
                  className={`btn btn-sm btn-${item.color} w-100`}
                >
                  {syncing === item.type ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Syncing...</>
                  ) : item.type === 'initial' ? 'Run Full Sync' : 'Sync Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
