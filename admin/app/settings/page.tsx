'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';
import Modal from '@/components/Modal';
import SsoModeSwitch from './components/SsoModeSwitch';

interface MerchantSettings {
  shopDomain: string;
  snippetEnabled: boolean;
  ssoMode: string;
  storefrontToken: string;
  lastSyncAt: string | null;
  stats?: {
    totalCustomers: number;
    syncedCustomers: number;
    totalProducts: number;
    totalOrders: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [modal, setModal] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({
    show: false,
    type: 'success',
    message: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/settings/merchant');
      
      if (response.ok) {
        const data = await response.json();
        setSettings({
          shopDomain: data.settings?.shopDomain || '',
          snippetEnabled: data.snippetEnabled ?? true,
          ssoMode: data.settings?.ssoMode || 'alternative',
          storefrontToken: data.settings?.storefrontToken || '',
          lastSyncAt: data.lastSyncAt,
          stats: data.stats,
        });
      } else {
        const err = await response.json();
        setModal({
          show: true,
          type: 'error',
          message: err.message || 'Failed to load settings',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setModal({
        show: true,
        type: 'error',
        message: 'Failed to connect to server',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: 'customers' | 'products' | 'orders' | 'initial') => {
    setSyncing(type);
    try {
      const endpoint = type === 'initial' ? '/api/v1/sync/initial' : `/api/v1/sync/${type}`;
      const response = await adminFetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        setModal({
          show: true,
          type: 'success',
          message: type === 'initial' 
            ? 'Full sync started! This may take a few minutes.' 
            : `${type.charAt(0).toUpperCase() + type.slice(1)} sync started!`,
        });
        // Reload settings after a delay
        setTimeout(loadSettings, 3000);
      } else {
        const err = await response.json();
        setModal({
          show: true,
          type: 'error',
          message: err.message || 'Sync failed',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setModal({
        show: true,
        type: 'error',
        message: `Sync failed: ${message}`,
      });
    } finally {
      setSyncing(null);
    }
  };

  const snippetCode = settings?.shopDomain 
    ? `<script src="https://cdn.eagledtfsupply.com/snippet.iife.js" data-api-url="https://api.eagledtfsupply.com" data-shop="${settings.shopDomain}"></script>`
    : '';

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setModal({ show: true, type: 'success', message: 'Snippet copied to clipboard!' });
    } catch {
      setModal({ show: true, type: 'error', message: 'Failed to copy' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Settings</h4>
        <p className="mb-0 text-muted">Shopify integration and sync configuration</p>
      </div>

      {/* Shopify Connection Status */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="ti ti-brand-shopify me-2"></i>
            Shopify Connection
          </h5>
          <span className="badge bg-success">Connected</span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1 text-muted small">Store Domain</p>
              <p className="fw-semibold">{settings?.shopDomain || 'Not configured'}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1 text-muted small">Last Sync</p>
              <p className="fw-semibold">
                {settings?.lastSyncAt 
                  ? new Date(settings.lastSyncAt).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SSO Configuration */}
      <SsoModeSwitch />

      {/* Data Synchronization */}
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
            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-users ti-lg text-primary mb-2 d-block"></i>
                <p className="mb-1 fw-semibold">Customers</p>
                <p className="mb-2 small text-muted">
                  {settings?.stats?.syncedCustomers || 0} / {settings?.stats?.totalCustomers || 0} synced
                </p>
                <button
                  onClick={() => handleSync('customers')}
                  disabled={syncing !== null}
                  className="btn btn-sm btn-primary w-100"
                >
                  {syncing === 'customers' ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Syncing...</>
                  ) : 'Sync Now'}
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-package ti-lg text-success mb-2 d-block"></i>
                <p className="mb-1 fw-semibold">Products</p>
                <p className="mb-2 small text-muted">
                  {settings?.stats?.totalProducts || 0} total
                </p>
                <button
                  onClick={() => handleSync('products')}
                  disabled={syncing !== null}
                  className="btn btn-sm btn-success w-100"
                >
                  {syncing === 'products' ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Syncing...</>
                  ) : 'Sync Now'}
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-shopping-cart ti-lg text-warning mb-2 d-block"></i>
                <p className="mb-1 fw-semibold">Orders</p>
                <p className="mb-2 small text-muted">
                  {settings?.stats?.totalOrders || 0} total
                </p>
                <button
                  onClick={() => handleSync('orders')}
                  disabled={syncing !== null}
                  className="btn btn-sm btn-warning w-100"
                >
                  {syncing === 'orders' ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Syncing...</>
                  ) : 'Sync Now'}
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center bg-light">
                <i className="ti ti-refresh ti-lg text-danger mb-2 d-block"></i>
                <p className="mb-1 fw-semibold">Full Sync</p>
                <p className="mb-2 small text-muted">All data</p>
                <button
                  onClick={() => handleSync('initial')}
                  disabled={syncing !== null}
                  className="btn btn-sm btn-danger w-100"
                >
                  {syncing === 'initial' ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Syncing...</>
                  ) : 'Run Full Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snippet Integration */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="ti ti-code me-2"></i>
            Snippet Integration
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">
            Add this snippet to your Shopify theme to enable B2B features on your storefront.
          </p>
          <div className="bg-dark p-3 rounded mb-3">
            <code className="text-light small" style={{wordBreak: 'break-all'}}>
              {snippetCode || 'Configure shop domain first'}
            </code>
          </div>
          <button 
            onClick={copySnippet} 
            className="btn btn-outline-primary"
            disabled={!snippetCode}
          >
            <i className="ti ti-copy me-1"></i>
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        title={modal.type === 'success' ? 'Success' : 'Error'}
        message={modal.message}
        confirmText="OK"
        type={modal.type === 'success' ? 'success' : 'danger'}
      />
    </div>
  );
}
