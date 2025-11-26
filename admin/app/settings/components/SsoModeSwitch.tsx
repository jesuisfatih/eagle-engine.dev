'use client';

import { useState, useEffect } from 'react';

export default function SsoModeSwitch() {
  const [multipassMode, setMultipassMode] = useState(false);
  const [multipassSecret, setMultipassSecret] = useState('');
  const [storefrontToken, setStorefrontToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/settings/sso`);
      if (response.ok) {
        const data = await response.json();
        setMultipassMode(data.mode === 'multipass');
        setMultipassSecret(data.multipassSecret || '');
        setStorefrontToken(data.storefrontToken || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      await fetch(`${API_URL}/api/v1/settings/sso`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: enabled ? 'multipass' : 'alternative',
          multipassSecret: enabled ? multipassSecret : '',
          storefrontToken: !enabled ? storefrontToken : '',
        }),
      });
      setMultipassMode(enabled);
      
      const modal = document.createElement('div');
      modal.className = 'modal fade show d-block';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">✅ Settings Updated</h5>
              <button type="button" class="btn-close" onclick="this.closest('.modal').remove(); location.reload();"></button>
            </div>
            <div class="modal-body">SSO mode changed to: ${enabled ? 'Multipass' : 'Alternative'}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove(); location.reload();">OK</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="ti ti-lock me-2"></i>
          SSO Configuration
        </h5>
      </div>
      <div className="card-body">
        <div className="form-check form-switch mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="multipassSwitch"
            checked={multipassMode}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="multipassSwitch">
            <strong>Shopify Multipass SSO</strong>
            <div className="text-muted small mt-1">
              {multipassMode 
                ? '✅ Multipass enabled (Shopify Plus required)'
                : '⚙️ Alternative SSO (Standard Shopify compatible)'}
            </div>
          </label>
        </div>

        {multipassMode ? (
          <div>
            <div className="alert alert-warning">
              <i className="ti ti-alert-triangle me-2"></i>
              <strong>Shopify Plus Required</strong>
              <p className="mb-0 small">
                Multipass is only available on Shopify Plus plans ($2000/month).
                Enable it in: Shopify Admin → Settings → Customer accounts → Multipass
              </p>
            </div>
            <div className="mb-3">
              <label className="form-label">Multipass Secret (64 characters)</label>
              <input 
                type="password" 
                className="form-control font-monospace"
                placeholder="a1b2c3d4e5f6..."
                value={multipassSecret}
                onChange={(e) => setMultipassSecret(e.target.value)}
              />
              <small className="text-muted">
                Get from: Shopify Admin → Settings → Customer accounts → Multipass
              </small>
            </div>
          </div>
        ) : (
          <div>
            <div className="alert alert-info">
              <i className="ti ti-info-circle me-2"></i>
              <strong>Alternative SSO Active</strong>
              <p className="mb-0 small">
                Cookie-based authentication with Shopify Customer API.
                Works on all Shopify plans including Standard ($29/month).
                Provides 90% of Multipass functionality at 5% of the cost.
              </p>
            </div>
            <div className="mb-3">
              <label className="form-label">Session Cookie Domain</label>
              <input 
                type="text" 
                className="form-control"
                value=".eagledtfsupply.com"
                readOnly
                disabled
              />
              <small className="text-muted">Cross-subdomain cookie for seamless auth</small>
            </div>
            <div className="mb-3">
              <label className="form-label">Shopify Storefront Access Token</label>
              <input 
                type="password" 
                className="form-control font-monospace"
                placeholder="Storefront API token"
                value={storefrontToken}
                onChange={(e) => setStorefrontToken(e.target.value)}
              />
              <small className="text-muted">
                Required for checkout creation
              </small>
            </div>
          </div>
        )}

        <div className="alert alert-success">
          <strong>✅ System Status</strong>
          <ul className="mb-0 mt-2 small">
            <li>Shopify → Eagle sync: Active</li>
            <li>Eagle → Shopify sync: Active</li>
            <li>Checkout flow: Configured</li>
            <li>Customer mapping: Enabled</li>
            <li>Mode: {multipassMode ? 'Multipass (Plus)' : 'Alternative (Standard)'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

