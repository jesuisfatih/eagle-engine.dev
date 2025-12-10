'use client';

import { useState, useEffect } from 'react';
import { apiClient, adminFetch } from '@/lib/api-client';
import Modal from '@/components/Modal';
import SnippetTester from './components/SnippetTester';
import SyncProgress from './components/SyncProgress';
import SsoModeSwitch from './components/SsoModeSwitch';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    shopDomain: '',
    apiKey: '',
    snippetEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
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
      const response = await adminFetch('/api/v1/merchants/settings');
      
      if (response.ok) {
        const data = await response.json();
        setSettings({
          shopDomain: data.shopDomain || '',
          apiKey: data.apiKey || '',
          snippetEnabled: data.snippetEnabled ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const snippetCode = `<script src="https://cdn.eagledtfsupply.com/snippet.iife.js" 
  data-api-url="https://api.eagledtfsupply.com" 
  data-shop="${settings.shopDomain}"></script>`;

  const handleSaveSettings = async () => {
    // Validation
    if (!settings.shopDomain) {
      setModal({
        show: true,
        type: 'error',
        message: 'Shop domain is required',
      });
      return;
    }

    if (!settings.shopDomain.includes('.myshopify.com')) {
      setModal({
        show: true,
        type: 'error',
        message: 'Invalid shop domain format',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await adminFetch('/api/v1/merchants/settings', {
        method: 'PUT',
        body: JSON.stringify({
          shopDomain: settings.shopDomain,
          apiKey: settings.apiKey,
          snippetEnabled: settings.snippetEnabled,
        }),
      });
      
      setModal({
        show: true,
        type: 'success',
        message: 'Settings saved successfully!',
      });
    } catch (err: any) {
      setModal({
        show: true,
        type: 'error',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (type: 'customers' | 'products' | 'orders' | 'initial') => {
    setSyncing(true);
    try {
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      
      if (!merchantId) {
        setModal({
          show: true,
          type: 'error',
          message: 'Merchant ID not found. Please configure merchant settings.',
        });
        setSyncing(false);
        return;
      }
      
      if (type === 'initial') {
        await adminFetch('/api/v1/sync/initial', { 
          method: 'POST',
          body: JSON.stringify({ merchantId })
        });
        setModal({
          show: true,
          type: 'success',
          message: 'Full sync started! Check back in a few minutes.',
        });
      } else {
        await adminFetch(`/api/v1/sync/${type}`, {
          method: 'POST',
        });
        setModal({
          show: true,
          type: 'success',
          message: `${type} sync queued successfully!`,
        });
      }
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setModal({
        show: true,
        type: 'error',
        message: `Sync failed: ${err.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setModal({
        show: true,
        type: 'success',
        message: 'Snippet code copied to clipboard!',
      });
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = snippetCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setModal({
        show: true,
        type: 'success',
        message: 'Snippet code copied!',
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Settings</h4>
        <p className="mb-0 text-muted">Configure your Eagle B2B installation</p>
      </div>

      {/* Shopify Connection */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Shopify Connection</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Shop Domain</label>
              <input
                type="text"
                className="form-control"
                value={settings.shopDomain}
                onChange={(e) => setSettings({...settings, shopDomain: e.target.value})}
                placeholder="your-store.myshopify.com"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">API Key</label>
              <input
                type="text"
                className="form-control"
                value={settings.apiKey}
                onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={async () => {
                try {
                  await adminFetch('/api/v1/sync/customers', { method: 'POST' });
                  setModal({
                    show: true,
                    type: 'success',
                    message: 'Test successful! Connection OK.',
                  });
                } catch (err: any) {
                  setModal({
                    show: true,
                    type: 'error',
                    message: 'Connection failed: ' + err.message,
                  });
                }
              }}
              className="btn btn-label-secondary"
            >
              <i className="ti ti-plug me-1"></i>
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Snippet Integration */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Snippet Integration</h5>
        </div>
        <div className="card-body">
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={settings.snippetEnabled}
              onChange={(e) => setSettings({...settings, snippetEnabled: e.target.checked})}
            />
            <label className="form-check-label">
              Enable App Embed (Recommended)
            </label>
          </div>

          <div>
            <label className="form-label">Manual Snippet Code</label>
            <div className="bg-dark p-3 rounded">
              <code className="text-light small">{snippetCode}</code>
            </div>
            <button onClick={copySnippet} className="btn btn-sm btn-outline-primary mt-2">
              <i className="ti ti-copy me-1"></i>
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      {/* SSO Configuration */}
      <SsoModeSwitch />

      {/* Data Sync */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Data Synchronization</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-info mb-3">
            <i className="ti ti-info-circle me-2"></i>
            Auto-sync runs every 20 seconds for customers. Manual sync available below.
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-users ti-lg text-primary mb-2"></i>
                <p className="mb-2 small">Customers</p>
                <button
                  onClick={() => handleSync('customers')}
                  disabled={syncing}
                  className="btn btn-sm btn-primary w-100"
                >
                  Sync Now
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-shopping-cart ti-lg text-success mb-2"></i>
                <p className="mb-2 small">Products</p>
                <button
                  onClick={() => handleSync('products')}
                  disabled={syncing}
                  className="btn btn-sm btn-success w-100"
                >
                  Sync Now
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-package ti-lg text-warning mb-2"></i>
                <p className="mb-2 small">Orders</p>
                <button
                  onClick={() => handleSync('orders')}
                  disabled={syncing}
                  className="btn btn-sm btn-warning w-100"
                >
                  Sync Now
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded p-3 text-center">
                <i className="ti ti-refresh ti-lg text-danger mb-2"></i>
                <p className="mb-2 small">Full Sync</p>
                <button
                  onClick={() => handleSync('initial')}
                  disabled={syncing}
                  className="btn btn-sm btn-danger w-100"
                >
                  {syncing ? 'Syncing...' : 'Run Full Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <SnippetTester />
        </div>
        <div className="col-md-6">
          <SyncProgress />
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        title={modal.type === 'success' ? 'Başarılı' : 'Hata'}
        message={modal.message}
        confirmText="Tamam"
        type={modal.type === 'success' ? 'success' : 'danger'}
      />
    </div>
  );
}
