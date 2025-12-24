'use client';

import { showToast } from '@/components/ui';
import type { AdminMerchantSettings } from './types';

interface SnippetIntegrationProps {
  settings: AdminMerchantSettings | null;
}

export default function SnippetIntegration({ settings }: SnippetIntegrationProps) {
  const snippetCode = settings?.shopDomain 
    ? `<script src="https://cdn.eagledtfsupply.com/snippet.iife.js" data-api-url="https://api.eagledtfsupply.com" data-shop="${settings.shopDomain}"></script>`
    : '';

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      showToast('success', 'Snippet copied to clipboard!');
    } catch {
      showToast('error', 'Failed to copy');
    }
  };

  const themeAppExtensionGuide = `
1. Go to your Shopify Admin → Online Store → Themes
2. Click "Customize" on your active theme
3. Go to Theme Settings → App Embeds
4. Enable "Eagle B2B" app embed
5. Save changes
  `.trim();

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="ti ti-code me-2"></i>
          Snippet Integration
        </h5>
      </div>
      <div className="card-body">
        {/* Method 1: Script Tag */}
        <div className="mb-4">
          <h6 className="mb-2">
            <span className="badge bg-primary me-2">Option 1</span>
            Script Tag (Recommended)
          </h6>
          <p className="text-muted small mb-3">
            Add this snippet to your Shopify theme layout.liquid file, before the closing &lt;/body&gt; tag.
          </p>
          <div className="bg-dark p-3 rounded mb-3">
            <code className="text-success small" style={{wordBreak: 'break-all'}}>
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

        <hr />

        {/* Method 2: Theme App Extension */}
        <div>
          <h6 className="mb-2">
            <span className="badge bg-secondary me-2">Option 2</span>
            Theme App Extension
          </h6>
          <p className="text-muted small mb-3">
            If the Eagle B2B app is installed, you can enable it via Theme Settings.
          </p>
          <div className="bg-light p-3 rounded">
            <pre className="mb-0 small text-muted" style={{whiteSpace: 'pre-wrap'}}>
              {themeAppExtensionGuide}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
