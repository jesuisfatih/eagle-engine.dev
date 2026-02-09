'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/api-client';
import { showToast } from '@/components/ui';
import type { AdminMerchantSettings } from './types';

interface DataSyncProps {
  settings: AdminMerchantSettings | null;
  onSyncComplete: () => void;
}

const COLORS: Record<string, string> = { primary: 'var(--accent-blue)', success: 'var(--accent-green)', warning: 'var(--accent-orange)', danger: 'var(--accent-red)' };
const SOFTS: Record<string, string> = { primary: 'var(--accent-blue-soft)', success: 'var(--accent-green-soft)', warning: 'var(--accent-orange-soft)', danger: 'var(--accent-red-soft)' };

export default function DataSync({ settings, onSyncComplete }: DataSyncProps) {
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = async (type: 'customers' | 'products' | 'orders' | 'initial') => {
    setSyncing(type);
    try {
      const endpoint = type === 'initial' ? '/api/v1/sync/initial' : `/api/v1/sync/${type}`;
      const response = await adminFetch(endpoint, { method: 'POST' });
      if (response.ok) {
        const message = type === 'initial' ? 'Full sync started!' : `${type.charAt(0).toUpperCase() + type.slice(1)} sync started!`;
        showToast(message, 'success');
        setTimeout(onSyncComplete, 3000);
      } else {
        const err = await response.json();
        showToast(err.message || 'Sync failed', 'danger');
      }
    } catch (err: unknown) {
      showToast(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'danger');
    } finally { setSyncing(null); }
  };

  const syncItems = [
    { type: 'customers' as const, label: 'Customers', icon: 'users', color: 'primary', stats: `${settings?.stats?.syncedCustomers || 0} / ${settings?.stats?.totalCustomers || 0} synced` },
    { type: 'products' as const, label: 'Products', icon: 'package', color: 'success', stats: `${settings?.stats?.totalProducts || 0} total` },
    { type: 'orders' as const, label: 'Orders', icon: 'shopping-cart', color: 'warning', stats: `${settings?.stats?.totalOrders || 0} total` },
    { type: 'initial' as const, label: 'Full Sync', icon: 'refresh', color: 'danger', stats: 'All data' },
  ];

  return (
    <div className="apple-card" style={{ marginBottom: 20 }}>
      <div className="apple-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-refresh" style={{ fontSize: 18 }} />
          <h3 className="apple-card-title">Data Synchronization</h3>
        </div>
      </div>
      <div className="apple-card-body">
        <div className="apple-alert info" style={{ marginBottom: 16 }}>
          <i className="ti ti-info-circle" />
          <span>Auto-sync runs every 5 minutes for customers. Use manual sync for immediate updates.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {syncItems.map(item => (
            <div key={item.type} style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center', background: item.type === 'initial' ? 'var(--bg-tertiary)' : 'transparent' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: SOFTS[item.color], color: COLORS[item.color], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 18 }}>
                <i className={`ti ti-${item.icon}`} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>{item.stats}</p>
              <button onClick={() => handleSync(item.type)} disabled={syncing !== null}
                className={`btn-apple ${item.type === 'initial' ? 'danger' : 'primary'} small`} style={{ width: '100%' }}>
                {syncing === item.type ? (<><i className="ti ti-loader-2 spin" /> Syncing...</>) : item.type === 'initial' ? 'Run Full Sync' : 'Sync Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
