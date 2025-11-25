'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [snippetEnabled, setSnippetEnabled] = useState(true);
  const snippetCode = `<script src="https://cdn.eagledtfsupply.com/snippet.js" data-api-url="https://api.eagledtfsupply.com" data-shop="your-store.myshopify.com"></script>`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your Eagle B2B installation</p>
      </div>

      {/* Snippet Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Snippet Integration</h2>
        <p className="mt-1 text-sm text-gray-500">Integrate Eagle with your Shopify theme</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">App Embed Status</p>
              <p className="text-sm text-gray-500">Automatically load snippet via Shopify app embed</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={snippetEnabled}
                onChange={(e) => setSnippetEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Manual Snippet Code</label>
            <p className="mt-1 text-sm text-gray-500">Copy and paste this code into your theme's layout file</p>
            <div className="mt-2 rounded-lg bg-gray-900 p-4">
              <code className="text-sm text-green-400">{snippetCode}</code>
            </div>
            <button className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Data Synchronization</h2>
        <p className="mt-1 text-sm text-gray-500">Sync your Shopify data with Eagle</p>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Last Customers Sync</p>
              <p className="mt-1 font-semibold text-gray-900">2 minutes ago</p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Sync Now
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Last Products Sync</p>
              <p className="mt-1 font-semibold text-gray-900">5 minutes ago</p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Sync Now
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Last Orders Sync</p>
              <p className="mt-1 font-semibold text-gray-900">1 minute ago</p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Sync Now
              </button>
            </div>
          </div>

          <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
            Run Full Initial Sync
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name</label>
            <input
              type="text"
              defaultValue="My Shopify Store"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Currency</label>
            <select className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
            </select>
          </div>

          <button className="w-full rounded-lg bg-gray-900 py-2 font-semibold text-white hover:bg-gray-800">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}



