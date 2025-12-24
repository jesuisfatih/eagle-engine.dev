'use client';

import type { AdminMerchantSettings } from './types';

interface ShopifyConnectionProps {
  settings: AdminMerchantSettings | null;
}

export default function ShopifyConnection({ settings }: ShopifyConnectionProps) {
  return (
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
        
        {/* API Configuration */}
        <hr className="my-3" />
        <div className="row">
          <div className="col-md-6">
            <p className="mb-1 text-muted small">API Base URL</p>
            <p className="fw-semibold text-primary">https://api.eagledtfsupply.com</p>
          </div>
          <div className="col-md-6">
            <p className="mb-1 text-muted small">CDN URL</p>
            <p className="fw-semibold text-primary">https://cdn.eagledtfsupply.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
