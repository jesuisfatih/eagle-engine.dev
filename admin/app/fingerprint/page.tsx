'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '../../lib/api-client';

interface FingerprintStats {
  totalVisitors: number;
  returningVisitors: number;
  identifiedVisitors: number;
  botCount: number;
  identificationRate: string | number;
}

interface IntentDistribution {
  intent: string;
  count: number;
}

interface RecentVisitor {
  id: string;
  fingerprintHash: string;
  platform: string;
  visitCount: number;
  lastSeenAt: string;
  firstSeenAt: string;
  isIdentified: boolean;
  identity: {
    email: string;
    name: string;
    company: string;
    buyerIntent: string;
    engagementScore: number;
  } | null;
}

interface EngagedVisitor {
  id: string;
  email: string;
  name: string;
  company: string;
  buyerIntent: string;
  segment: string;
  engagementScore: number;
  totalPageViews: number;
  totalProductViews: number;
  totalAddToCarts: number;
  totalOrders: number;
  totalRevenue: number;
  platform: string;
  visitCount: number;
  lastSeenAt: string;
}

interface HotLead {
  id: string;
  email: string;
  name: string;
  company: string;
  buyerIntent: string;
  engagementScore: number;
  totalProductViews: number;
  totalAddToCarts: number;
  lastProductViewed: string;
  platform: string;
  timezone: string;
  visitCount: number;
  lastSeenAt: string;
}

export default function FingerprintPage() {
  const [stats, setStats] = useState<FingerprintStats | null>(null);
  const [intentDistribution, setIntentDistribution] = useState<IntentDistribution[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<RecentVisitor[]>([]);
  const [topEngaged, setTopEngaged] = useState<EngagedVisitor[]>([]);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'leads' | 'engaged'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminFetch('/api/v1/fingerprint/dashboard');
      setStats(data.stats);
      setIntentDistribution(data.intentDistribution || []);
      setRecentVisitors(data.recentVisitors || []);
      setTopEngaged(data.topEngaged || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load fingerprint data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHotLeads = useCallback(async () => {
    try {
      const data = await adminFetch('/api/v1/fingerprint/hot-leads');
      setHotLeads(data.leads || []);
    } catch (err: any) {
      console.error('Failed to load hot leads', err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadHotLeads();
  }, [loadDashboard, loadHotLeads]);

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'hot': return '#ef4444';
      case 'warm': return '#f59e0b';
      case 'cold': return '#3b82f6';
      case 'converting': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getIntentEmoji = (intent: string) => {
    switch (intent) {
      case 'hot': return '🔥';
      case 'warm': return '🌡️';
      case 'cold': return '❄️';
      case 'converting': return '💰';
      default: return '👤';
    }
  };

  const getSegmentBadge = (segment: string) => {
    const colors: Record<string, string> = {
      VIP: 'bg-purple-500',
      customer: 'bg-green-500',
      abandoned_cart: 'bg-red-500',
      browser: 'bg-blue-500',
      new_visitor: 'bg-gray-500',
    };
    return colors[segment] || 'bg-gray-500';
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-500">Loading Fingerprint Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🧬 Fingerprint Intelligence
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time visitor identification, behavioral profiling & buyer intent analysis
          </p>
        </div>
        <button
          onClick={() => { loadDashboard(); loadHotLeads(); }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-500">Total Visitors</div>
            <div className="mt-1 text-3xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Unique fingerprints</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-500">Returning</div>
            <div className="mt-1 text-3xl font-bold text-blue-600">{stats.returningVisitors.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Multi-visit visitors</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-500">Identified</div>
            <div className="mt-1 text-3xl font-bold text-green-600">{stats.identifiedVisitors.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Linked to accounts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-500">ID Rate</div>
            <div className="mt-1 text-3xl font-bold text-purple-600">{stats.identificationRate}%</div>
            <div className="text-xs text-gray-400 mt-1">Resolution effectiveness</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-500">Bots Blocked</div>
            <div className="mt-1 text-3xl font-bold text-red-500">{stats.botCount.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Auto-detected</div>
          </div>
        </div>
      )}

      {/* Intent Distribution */}
      {intentDistribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Intent Distribution</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {intentDistribution.map((d) => (
              <div
                key={d.intent}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border"
                style={{ borderColor: getIntentColor(d.intent) + '40', background: getIntentColor(d.intent) + '10' }}
              >
                <span className="text-xl">{getIntentEmoji(d.intent)}</span>
                <div>
                  <div className="font-semibold capitalize" style={{ color: getIntentColor(d.intent) }}>
                    {d.intent}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{d.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'visitors', 'leads', 'engaged'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'visitors' && `👤 Recent Visitors (${recentVisitors.length})`}
              {tab === 'leads' && `🔥 Hot Leads (${hotLeads.length})`}
              {tab === 'engaged' && `⭐ Top Engaged (${topEngaged.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Visitors Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🕐 Recent Visitors</h3>
            <div className="space-y-3">
              {recentVisitors.slice(0, 8).map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${v.isIdentified ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {v.identity?.name || v.identity?.email || v.fingerprintHash}
                      </div>
                      <div className="text-xs text-gray-500">
                        {v.identity?.company && `${v.identity.company} · `}
                        {v.platform} · {v.visitCount} visits
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {v.identity?.buyerIntent && (
                      <span className="text-xs mr-1">{getIntentEmoji(v.identity.buyerIntent)}</span>
                    )}
                    <span className="text-xs text-gray-400">{timeAgo(v.lastSeenAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Leads Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Hot Leads</h3>
            {hotLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🎯</div>
                <p>No hot leads detected yet.</p>
                <p className="text-xs mt-1">Leads appear when visitors show high purchase intent.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hotLeads.slice(0, 8).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {lead.name || lead.email || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.company && `${lead.company} · `}
                        {lead.totalProductViews} views · {lead.totalAddToCarts} carts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold" style={{ color: getIntentColor(lead.buyerIntent) }}>
                        {getIntentEmoji(lead.buyerIntent)} {lead.engagementScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400">{timeAgo(lead.lastSeenAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'visitors' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${v.isIdentified ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {v.identity?.name || v.identity?.email || v.fingerprintHash}
                        </div>
                        {v.identity?.company && (
                          <div className="text-xs text-gray-500">{v.identity.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.platform || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{v.visitCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {v.identity?.buyerIntent ? (
                      <span className="text-sm" style={{ color: getIntentColor(v.identity.buyerIntent) }}>
                        {getIntentEmoji(v.identity.buyerIntent)} {v.identity.buyerIntent}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {v.identity?.engagementScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, v.identity.engagementScore)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{v.identity.engagementScore.toFixed(0)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeAgo(v.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {hotLeads.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-lg">No hot leads detected yet</p>
              <p className="text-sm mt-1">Visitors with high engagement but no orders will appear here.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cart Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timezone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hotLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-orange-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name || lead.email || 'Anonymous'}</div>
                        {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getIntentColor(lead.buyerIntent) + '20',
                          color: getIntentColor(lead.buyerIntent),
                        }}
                      >
                        {getIntentEmoji(lead.buyerIntent)} {lead.buyerIntent}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.totalProductViews}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.totalAddToCarts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, lead.engagementScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-orange-600">{lead.engagementScore.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{lead.timezone || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeAgo(lead.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'engaged' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topEngaged.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{e.name || e.email || 'Anonymous'}</div>
                      {e.company && <div className="text-xs text-gray-500">{e.company}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {e.segment && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getSegmentBadge(e.segment)}`}>
                        {e.segment.replace(/_/g, ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, e.engagementScore)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-purple-600">{e.engagementScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.totalPageViews}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.totalProductViews}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.totalAddToCarts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.totalOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${e.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
              {topEngaged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                    <div className="text-5xl mb-3">⭐</div>
                    <p className="text-lg">No engaged visitors yet</p>
                    <p className="text-sm mt-1">Engagement data will populate as visitors interact with your store.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
