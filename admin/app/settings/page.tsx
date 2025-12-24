'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';
import { PageHeader, PageContent, Tabs, showToast } from '@/components/ui';
import ShopifyConnection from './components/ShopifyConnection';
import SsoModeSwitch from './components/SsoModeSwitch';
import DataSync from './components/DataSync';
import SnippetIntegration from './components/SnippetIntegration';
import SnippetTester from './components/SnippetTester';
import type { AdminMerchantSettings } from './components/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminMerchantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connection');

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
        showToast('error', err.message || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      showToast('error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'connection', label: 'Connection', icon: 'plug' },
    { id: 'sso', label: 'SSO', icon: 'shield' },
    { id: 'sync', label: 'Data Sync', icon: 'refresh' },
    { id: 'snippet', label: 'Snippet', icon: 'code' },
    { id: 'test', label: 'Tester', icon: 'test-pipe' },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Shopify integration and sync configuration"
        actions={[
          {
            label: 'Sync Logs',
            icon: 'list',
            variant: 'secondary',
            href: '/settings/sync-logs',
          },
          {
            label: 'Refresh',
            icon: 'refresh',
            variant: 'primary',
            onClick: loadSettings,
            disabled: loading,
          },
        ]}
      />

      <PageContent loading={loading}>
        {/* Tabs Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'connection' && (
          <ShopifyConnection settings={settings} />
        )}

        {activeTab === 'sso' && (
          <SsoModeSwitch />
        )}

        {activeTab === 'sync' && (
          <DataSync settings={settings} onSyncComplete={loadSettings} />
        )}

        {activeTab === 'snippet' && (
          <SnippetIntegration settings={settings} />
        )}

        {activeTab === 'test' && (
          <SnippetTester />
        )}
      </PageContent>
    </div>
  );
}
