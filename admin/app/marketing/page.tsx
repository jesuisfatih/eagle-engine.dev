'use client';

import { PageHeader, StatsCard } from '@/components/ui';
import { adminFetch } from '@/lib/api-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

interface ChannelBreakdown {
  channel: string;
  sessions: number;
  avgDuration: number;
  avgPages: number;
  addToCarts: number;
  productViews: number;
}

interface CampaignRow {
  campaign: string;
  source: string;
  medium: string;
  channel: string;
  sessions: number;
  avgDuration: number;
  avgPages: number;
  addToCarts: number;
  productViews: number;
}

interface LandingPage {
  page: string;
  sessions: number;
  avgDuration: number;
  avgPages: number;
  addToCarts: number;
}

interface AttributionPath {
  fingerprint_id: string;
  journey: { touchNumber: number; channel: string; utmSource: string; utmCampaign: string; landingPage: string; createdAt: string }[];
  touch_count: number;
  has_conversion: boolean;
}

interface ReferrerDomain {
  domain: string;
  sessions: number;
}

interface DailyTrend {
  date: string;
  channel: string;
  sessions: number;
  unique_visitors: number;
  page_views: number;
  add_to_carts: number;
}

interface Summary {
  totalSessions: number;
  uniqueVisitors: number;
  avgDuration: number;
  avgPagesPerSession: number;
  totalPageViews: number;
  totalProductViews: number;
  totalAddToCarts: number;
}

interface TrafficData {
  summary: Summary;
  channelBreakdown: ChannelBreakdown[];
  campaignPerformance: CampaignRow[];
  funnelByChannel: any[];
  topLandingPages: LandingPage[];
  attributionPaths: AttributionPath[];
  referrerDomains: ReferrerDomain[];
  dailyTrend: DailyTrend[];
}

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const CHANNEL_META: Record<string, { label: string; color: string; icon: string }> = {
  google_ads: { label: 'Google Ads', color: '#4285F4', icon: 'ti-brand-google' },
  google_organic: { label: 'Google Organic', color: '#34A853', icon: 'ti-brand-google' },
  facebook_ads: { label: 'Facebook Ads', color: '#1877F2', icon: 'ti-brand-facebook' },
  facebook_organic: { label: 'Facebook Organic', color: '#1877F2', icon: 'ti-brand-facebook' },
  instagram_ads: { label: 'Instagram Ads', color: '#E4405F', icon: 'ti-brand-instagram' },
  instagram_organic: { label: 'Instagram Organic', color: '#E4405F', icon: 'ti-brand-instagram' },
  tiktok_ads: { label: 'TikTok Ads', color: '#000000', icon: 'ti-brand-tiktok' },
  tiktok_organic: { label: 'TikTok Organic', color: '#000000', icon: 'ti-brand-tiktok' },
  bing_ads: { label: 'Bing Ads', color: '#008373', icon: 'ti-search' },
  bing_organic: { label: 'Bing Organic', color: '#008373', icon: 'ti-search' },
  email: { label: 'Email', color: '#D44638', icon: 'ti-mail' },
  direct: { label: 'Direct', color: '#6B7280', icon: 'ti-world' },
  referral: { label: 'Referral', color: '#8B5CF6', icon: 'ti-link' },
  social_other: { label: 'Social (Other)', color: '#EC4899', icon: 'ti-share' },
  paid_other: { label: 'Paid (Other)', color: '#F59E0B', icon: 'ti-currency-dollar' },
  twitter_organic: { label: 'X / Twitter', color: '#1DA1F2', icon: 'ti-brand-twitter' },
  linkedin_organic: { label: 'LinkedIn', color: '#0A66C2', icon: 'ti-brand-linkedin' },
  youtube_organic: { label: 'YouTube', color: '#FF0000', icon: 'ti-brand-youtube' },
  pinterest_organic: { label: 'Pinterest', color: '#E60023', icon: 'ti-brand-pinterest' },
  reddit: { label: 'Reddit', color: '#FF4500', icon: 'ti-brand-reddit' },
  unknown: { label: 'Unknown', color: '#9CA3AF', icon: 'ti-question-mark' },
  internal: { label: 'Internal', color: '#6B7280', icon: 'ti-arrow-back' },
};

function getChannelMeta(channel: string) {
  return CHANNEL_META[channel] || { label: channel || 'Unknown', color: '#9CA3AF', icon: 'ti-question-mark' };
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getDateRange(preset: string): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d':  start.setDate(end.getDate() - 7); break;
    case '30d': start.setDate(end.getDate() - 30); break;
    case '90d': start.setDate(end.getDate() - 90); break;
    case 'all': start.setFullYear(2020); break;
    default:    start.setDate(end.getDate() - 30); break;
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export default function MarketingPage() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState('30d');
  const [channelFilter, setChannelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'attribution' | 'landing'>('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(datePreset);
      const params = new URLSearchParams({ startDate, endDate });
      if (channelFilter) params.set('channel', channelFilter);
      if (sourceFilter) params.set('utmSource', sourceFilter);
      if (campaignFilter) params.set('utmCampaign', campaignFilter);

      const res = await adminFetch(`/api/v1/fingerprint/traffic-analytics?${params}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [datePreset, channelFilter, sourceFilter, campaignFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Pre-compute max for bar charts
  const maxSessions = useMemo(() => {
    if (!data?.channelBreakdown?.length) return 1;
    return Math.max(...data.channelBreakdown.map(c => c.sessions), 1);
  }, [data]);

  const totalFunnelSessions = data?.summary?.totalSessions || 1;

  return (
    <div className="marketing-page">
      <PageHeader
        title="Marketing Attribution"
        subtitle="Multi-touch traffic source analytics — understand where your visitors come from and what converts"
      />

      {/* ─── Toolbar ─── */}
      <div className="mk-toolbar">
        <div className="mk-toolbar-group">
          {['7d', '30d', '90d', 'all'].map(p => (
            <button
              key={p}
              className={`mk-chip ${datePreset === p ? 'active' : ''}`}
              onClick={() => setDatePreset(p)}
            >
              {p === 'all' ? 'All Time' : `Last ${p.replace('d', ' days')}`}
            </button>
          ))}
        </div>
        <div className="mk-toolbar-group">
          <select className="mk-select" value={channelFilter} onChange={e => setChannelFilter(e.target.value)}>
            <option value="">All Channels</option>
            {data?.channelBreakdown?.map(c => (
              <option key={c.channel} value={c.channel}>{getChannelMeta(c.channel).label}</option>
            ))}
          </select>
          <select className="mk-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
            <option value="">All Sources</option>
            {[...new Set(data?.campaignPerformance?.map(c => c.source).filter(Boolean) || [])].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="mk-select" value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}>
            <option value="">All Campaigns</option>
            {[...new Set(data?.campaignPerformance?.map(c => c.campaign).filter(Boolean) || [])].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mk-loading">
          <i className="ti ti-loader-2 mk-spin" />
          <span>Analyzing traffic data...</span>
        </div>
      ) : !data ? (
        <div className="mk-empty">
          <i className="ti ti-chart-arrows" />
          <h3>No traffic data yet</h3>
          <p>Traffic attribution data will appear once visitors start arriving with tracking parameters.</p>
        </div>
      ) : (
        <>
          {/* ─── Summary Cards ─── */}
          <div className="mk-stats-grid">
            <StatsCard title="Total Sessions" value={data.summary.totalSessions.toLocaleString()} icon="ti-device-desktop" />
            <StatsCard title="Unique Visitors" value={data.summary.uniqueVisitors.toLocaleString()} icon="ti-users" />
            <StatsCard title="Avg Duration" value={formatDuration(data.summary.avgDuration)} icon="ti-clock" />
            <StatsCard title="Pages / Session" value={data.summary.avgPagesPerSession.toString()} icon="ti-file" />
            <StatsCard title="Total Page Views" value={data.summary.totalPageViews.toLocaleString()} icon="ti-eye" />
            <StatsCard title="Product Views" value={data.summary.totalProductViews.toLocaleString()} icon="ti-package" />
            <StatsCard title="Add to Carts" value={data.summary.totalAddToCarts.toLocaleString()} icon="ti-shopping-cart" />
          </div>

          {/* ─── Tabs ─── */}
          <div className="mk-tabs">
            {(['overview', 'campaigns', 'attribution', 'landing'] as const).map(tab => (
              <button
                key={tab}
                className={`mk-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <i className={`ti ${
                  tab === 'overview' ? 'ti-chart-pie' :
                  tab === 'campaigns' ? 'ti-speakerphone' :
                  tab === 'attribution' ? 'ti-route' :
                  'ti-map-pin'
                }`} />
                {tab === 'overview' ? 'Channel Overview' :
                 tab === 'campaigns' ? 'Campaigns' :
                 tab === 'attribution' ? 'Attribution Paths' :
                 'Landing Pages'}
              </button>
            ))}
          </div>

          {/* ─── Tab Content ─── */}
          <div className="mk-content">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="mk-overview">
                {/* Channel Breakdown */}
                <div className="mk-card">
                  <h3 className="mk-card-title">
                    <i className="ti ti-chart-bar" /> Channel Breakdown
                  </h3>
                  <div className="mk-channel-list">
                    {data.channelBreakdown.map(ch => {
                      const meta = getChannelMeta(ch.channel);
                      const pct = ((ch.sessions / totalFunnelSessions) * 100).toFixed(1);
                      return (
                        <div key={ch.channel} className="mk-channel-row">
                          <div className="mk-channel-info">
                            <span className="mk-channel-dot" style={{ background: meta.color }} />
                            <i className={`ti ${meta.icon}`} style={{ color: meta.color }} />
                            <span className="mk-channel-name">{meta.label}</span>
                            <span className="mk-channel-pct">{pct}%</span>
                          </div>
                          <div className="mk-channel-bar-wrap">
                            <div
                              className="mk-channel-bar"
                              style={{
                                width: `${(ch.sessions / maxSessions) * 100}%`,
                                background: `linear-gradient(90deg, ${meta.color}CC, ${meta.color}44)`,
                              }}
                            />
                          </div>
                          <div className="mk-channel-metrics">
                            <span title="Sessions"><strong>{ch.sessions}</strong> sessions</span>
                            <span title="Avg Duration">{formatDuration(ch.avgDuration)}</span>
                            <span title="Pages/Session">{ch.avgPages} pg/s</span>
                            <span title="Product Views">{ch.productViews} views</span>
                            <span title="Add to Carts" className="mk-atc">{ch.addToCarts} ATC</span>
                          </div>
                        </div>
                      );
                    })}
                    {data.channelBreakdown.length === 0 && (
                      <div className="mk-empty-inline">No channel data available</div>
                    )}
                  </div>
                </div>

                {/* Referrer Domains */}
                <div className="mk-card">
                  <h3 className="mk-card-title">
                    <i className="ti ti-world-www" /> Top Referrer Domains
                  </h3>
                  <div className="mk-referrer-list">
                    {data.referrerDomains.map((r, i) => (
                      <div key={r.domain} className="mk-referrer-row">
                        <span className="mk-referrer-rank">#{i + 1}</span>
                        <span className="mk-referrer-domain">{r.domain}</span>
                        <span className="mk-referrer-count">{r.sessions} sessions</span>
                      </div>
                    ))}
                    {data.referrerDomains.length === 0 && (
                      <div className="mk-empty-inline">No referrer data</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="mk-card mk-table-card">
                <h3 className="mk-card-title">
                  <i className="ti ti-speakerphone" /> Campaign Performance
                </h3>
                <div className="mk-table-wrap">
                  <table className="mk-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Source</th>
                        <th>Medium</th>
                        <th>Channel</th>
                        <th>Sessions</th>
                        <th>Avg Duration</th>
                        <th>Avg Pages</th>
                        <th>Product Views</th>
                        <th>Add to Cart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaignPerformance.map((c, i) => {
                        const meta = getChannelMeta(c.channel);
                        return (
                          <tr key={i}>
                            <td className="mk-td-campaign">{c.campaign || '—'}</td>
                            <td>{c.source || '—'}</td>
                            <td>{c.medium || '—'}</td>
                            <td>
                              <span className="mk-channel-badge" style={{ background: meta.color + '22', color: meta.color, borderColor: meta.color + '44' }}>
                                <i className={`ti ${meta.icon}`} /> {meta.label}
                              </span>
                            </td>
                            <td><strong>{c.sessions}</strong></td>
                            <td>{formatDuration(c.avgDuration)}</td>
                            <td>{c.avgPages}</td>
                            <td>{c.productViews}</td>
                            <td className="mk-atc">{c.addToCarts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {data.campaignPerformance.length === 0 && (
                    <div className="mk-empty-inline" style={{ padding: '3rem' }}>
                      No UTM-tagged campaigns detected yet. Add <code>?utm_campaign=...</code> to your campaign URLs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATTRIBUTION TAB */}
            {activeTab === 'attribution' && (
              <div className="mk-card">
                <h3 className="mk-card-title">
                  <i className="ti ti-route" /> Multi-Touch Attribution Paths
                </h3>
                <p className="mk-card-subtitle">
                  Visitor journeys with 2+ touchpoints — showing the exact path from first visit to last.
                </p>
                <div className="mk-attribution-list">
                  {data.attributionPaths.map((path, i) => (
                    <div key={i} className={`mk-journey ${path.has_conversion ? 'converted' : ''}`}>
                      <div className="mk-journey-header">
                        <span className="mk-journey-id" title={path.fingerprint_id}>
                          <i className="ti ti-fingerprint" /> {path.fingerprint_id.slice(0, 8)}...
                        </span>
                        <span className="mk-journey-count">{Number(path.touch_count)} touches</span>
                        {path.has_conversion && (
                          <span className="mk-journey-converted">
                            <i className="ti ti-check" /> Converted
                          </span>
                        )}
                      </div>
                      <div className="mk-journey-steps">
                        {path.journey.map((step, j) => {
                          const meta = getChannelMeta(step.channel);
                          return (
                            <div key={j} className="mk-journey-step">
                              {j > 0 && <i className="ti ti-arrow-right mk-journey-arrow" />}
                              <div className="mk-journey-touch" style={{ borderColor: meta.color }}>
                                <div className="mk-journey-touch-head" style={{ background: meta.color + '15' }}>
                                  <i className={`ti ${meta.icon}`} style={{ color: meta.color }} />
                                  <span style={{ color: meta.color }}>{meta.label}</span>
                                </div>
                                <div className="mk-journey-touch-body">
                                  {step.utmCampaign && <small>Campaign: {step.utmCampaign}</small>}
                                  {step.utmSource && <small>Source: {step.utmSource}</small>}
                                  {step.landingPage && <small className="mk-journey-lp">{step.landingPage.split('?')[0]}</small>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {data.attributionPaths.length === 0 && (
                    <div className="mk-empty-inline" style={{ padding: '3rem' }}>
                      <i className="ti ti-route" style={{ fontSize: '2rem', opacity: 0.4 }} />
                      <p>Multi-touch attribution data will appear when visitors return multiple times through different channels.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LANDING PAGES TAB */}
            {activeTab === 'landing' && (
              <div className="mk-card mk-table-card">
                <h3 className="mk-card-title">
                  <i className="ti ti-map-pin" /> Top Landing Pages
                </h3>
                <div className="mk-table-wrap">
                  <table className="mk-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Landing Page</th>
                        <th>Sessions</th>
                        <th>Avg Duration</th>
                        <th>Avg Pages</th>
                        <th>Add to Cart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topLandingPages.map((l, i) => (
                        <tr key={i}>
                          <td className="mk-rank">{i + 1}</td>
                          <td className="mk-td-page">{l.page || '/'}</td>
                          <td><strong>{l.sessions}</strong></td>
                          <td>{formatDuration(l.avgDuration)}</td>
                          <td>{l.avgPages}</td>
                          <td className="mk-atc">{l.addToCarts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.topLandingPages.length === 0 && (
                    <div className="mk-empty-inline" style={{ padding: '3rem' }}>No landing page data available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .marketing-page {
          padding: 0;
        }

        /* ─── Toolbar ─── */
        .mk-toolbar {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 1rem 1.25rem;
          background: var(--card-bg, rgba(30,30,45,0.6));
          border: 1px solid var(--border-color, rgba(255,255,255,0.06));
          border-radius: 12px;
        }
        .mk-toolbar-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .mk-chip {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: var(--text-secondary, #9CA3AF);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mk-chip:hover { border-color: rgba(255,255,255,0.25); color: white; }
        .mk-chip.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(99,102,241,0.3);
        }
        .mk-select {
          padding: 6px 28px 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2);
          color: var(--text-primary, #E5E7EB);
          font-size: 0.8rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }
        .mk-select:hover { border-color: rgba(255,255,255,0.2); }

        /* ─── Loading / Empty ─── */
        .mk-loading, .mk-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 4rem;
          color: var(--text-secondary, #9CA3AF);
          text-align: center;
        }
        .mk-loading i { font-size: 2rem; }
        .mk-empty i { font-size: 3rem; opacity: 0.3; }
        .mk-empty h3 { color: var(--text-primary, #E5E7EB); margin: 0; }
        .mk-spin { animation: mk-spin 1s linear infinite; }
        @keyframes mk-spin { to { transform: rotate(360deg); } }

        /* ─── Stats Grid ─── */
        .mk-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        /* ─── Tabs ─── */
        .mk-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mk-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: none;
          background: none;
          color: var(--text-secondary, #9CA3AF);
          font-size: 0.85rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .mk-tab:hover { color: white; }
        .mk-tab.active {
          color: #818cf8;
          border-bottom-color: #818cf8;
          font-weight: 600;
        }

        /* ─── Card ─── */
        .mk-card {
          background: var(--card-bg, rgba(30,30,45,0.6));
          border: 1px solid var(--border-color, rgba(255,255,255,0.06));
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .mk-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #E5E7EB);
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mk-card-title i { color: #818cf8; }
        .mk-card-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary, #9CA3AF);
          margin: -0.5rem 0 1.25rem 0;
        }

        /* ─── Channel Breakdown ─── */
        .mk-overview {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .mk-overview { grid-template-columns: 1fr; }
        }
        .mk-channel-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .mk-channel-row {
          display: grid;
          grid-template-columns: 220px 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mk-channel-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mk-channel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .mk-channel-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary, #E5E7EB);
        }
        .mk-channel-pct {
          font-size: 0.75rem;
          color: var(--text-secondary, #9CA3AF);
          margin-left: auto;
        }
        .mk-channel-bar-wrap {
          height: 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 6px;
          overflow: hidden;
        }
        .mk-channel-bar {
          height: 100%;
          border-radius: 6px;
          transition: width 0.6s ease;
        }
        .mk-channel-metrics {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #9CA3AF);
          white-space: nowrap;
        }
        .mk-atc { color: #34D399; font-weight: 600; }

        /* ─── Referrer Domains ─── */
        .mk-referrer-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .mk-referrer-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mk-referrer-rank {
          font-size: 0.75rem;
          color: var(--text-secondary, #9CA3AF);
          min-width: 28px;
        }
        .mk-referrer-domain {
          font-size: 0.85rem;
          color: var(--text-primary, #E5E7EB);
          flex: 1;
        }
        .mk-referrer-count {
          font-size: 0.75rem;
          color: var(--text-secondary, #9CA3AF);
        }

        /* ─── Table ─── */
        .mk-table-card { padding: 0; overflow: hidden; }
        .mk-table-card .mk-card-title { padding: 1.25rem 1.5rem 0.75rem; }
        .mk-table-wrap { overflow-x: auto; }
        .mk-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .mk-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.2);
          color: var(--text-secondary, #9CA3AF);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          white-space: nowrap;
        }
        .mk-table td {
          padding: 0.65rem 1rem;
          color: var(--text-primary, #E5E7EB);
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .mk-table tbody tr:hover {
          background: rgba(255,255,255,0.02);
        }
        .mk-td-campaign { font-weight: 600; min-width: 180px; }
        .mk-td-page { font-family: monospace; font-size: 0.8rem; max-width: 400px; overflow: hidden; text-overflow: ellipsis; }
        .mk-rank { color: var(--text-secondary, #9CA3AF); font-weight: 600; }
        .mk-channel-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }
        .mk-empty-inline {
          text-align: center;
          color: var(--text-secondary, #9CA3AF);
          padding: 2rem;
          font-size: 0.85rem;
        }
        .mk-empty-inline code {
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        /* ─── Attribution Paths ─── */
        .mk-attribution-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .mk-journey {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.25rem;
          background: rgba(0,0,0,0.15);
          transition: border-color 0.2s;
        }
        .mk-journey:hover { border-color: rgba(255,255,255,0.12); }
        .mk-journey.converted { border-color: rgba(52,211,153,0.3); }
        .mk-journey-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .mk-journey-id {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-secondary, #9CA3AF);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .mk-journey-count {
          font-size: 0.75rem;
          background: rgba(129,140,248,0.15);
          color: #818cf8;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }
        .mk-journey-converted {
          font-size: 0.75rem;
          background: rgba(52,211,153,0.15);
          color: #34D399;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .mk-journey-steps {
          display: flex;
          align-items: flex-start;
          gap: 0;
          overflow-x: auto;
          padding: 0.5rem 0;
        }
        .mk-journey-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .mk-journey-arrow {
          color: rgba(255,255,255,0.2);
          font-size: 1.2rem;
        }
        .mk-journey-touch {
          border: 1px solid;
          border-radius: 10px;
          overflow: hidden;
          min-width: 150px;
        }
        .mk-journey-touch-head {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
        }
        .mk-journey-touch-body {
          padding: 0.4rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .mk-journey-touch-body small {
          font-size: 0.7rem;
          color: var(--text-secondary, #9CA3AF);
        }
        .mk-journey-lp {
          font-family: monospace;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
