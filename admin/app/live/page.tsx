'use client';

import { PageHeader, SearchInput, showToast, StatsCard, Tabs } from '@/components/ui';
import { adminFetch } from '@/lib/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ActiveVisitor {
  sessionId: string;
  status: 'online' | 'away' | 'offline';
  companyId?: string;
  companyName?: string;
  companyUserId?: string;
  userName?: string;
  userEmail?: string;
  platform?: string;
  currentPage: { url: string; path: string; title: string };
  viewport: { width: number; height: number };
  isIdentified: boolean;
  lastSeen: string;
  secondsAgo: number;
}

interface ActiveData {
  totalOnline: number;
  totalAway: number;
  totalVisitors: number;
  identifiedCount: number;
  activeCompanyCount: number;
  visitors: ActiveVisitor[];
}

interface ReplayEvent {
  x: number;
  y: number;
  t: number;
  type: string;
  pageUrl?: string;
  viewport?: { width: number; height: number };
}

interface ReplayData {
  session: {
    id: string;
    sessionId: string;
    companyName?: string;
    userName: string;
    platform?: string;
    userAgent?: string;
    startedAt: string;
    pageViews: number;
  } | null;
  events: ReplayEvent[];
  totalEvents: number;
  durationMs: number;
}

export default function LiveVisitorsPage() {
  const [data, setData] = useState<ActiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('visitors');
  const [search, setSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<ActiveVisitor | null>(null);
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const replayRef = useRef<HTMLDivElement>(null);
  const replayAnimRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [clickRings, setClickRings] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const fetchActive = useCallback(async () => {
    try {
      const res = await adminFetch('/api/v1/fingerprint/active-visitors');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Auto-refresh every 10s
  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  const loadReplay = async (sessionId: string) => {
    try {
      const res = await adminFetch(`/api/v1/fingerprint/replay?sessionId=${sessionId}`);
      if (res.ok) {
        const d = await res.json();
        setReplay(d);
        setReplayProgress(0);
        setReplayPlaying(false);
      }
    } catch {
      showToast('Failed to load replay', 'danger');
    }
  };

  const playReplay = () => {
    if (!replay || replay.events.length === 0) return;
    setReplayPlaying(true);

    const events = replay.events;
    const startTime = events[0].t;
    const endTime = events[events.length - 1].t;
    const duration = endTime - startTime;
    if (duration <= 0) return;

    let startPlayTime = Date.now();
    let ringId = 0;

    const animate = () => {
      const elapsed = Date.now() - startPlayTime;
      const progress = Math.min(1, elapsed / (duration * 0.5)); // 2x speed
      setReplayProgress(progress * 100);

      const targetTime = startTime + (duration * progress);

      // Find the event closest to current time
      let closest = events[0];
      for (const ev of events) {
        if (ev.t <= targetTime) closest = ev;
        else break;
      }

      if (closest.type === 'm' || closest.type === 'c') {
        setCursorPos({ x: closest.x, y: closest.y });
      }

      if (closest.type === 'c') {
        const id = ++ringId;
        setClickRings(prev => [...prev, { id, x: closest.x, y: closest.y }]);
        setTimeout(() => {
          setClickRings(prev => prev.filter(r => r.id !== id));
        }, 500);
      }

      if (progress < 1) {
        replayAnimRef.current = requestAnimationFrame(animate);
      } else {
        setReplayPlaying(false);
      }
    };

    replayAnimRef.current = requestAnimationFrame(animate);
  };

  const stopReplay = () => {
    if (replayAnimRef.current) {
      cancelAnimationFrame(replayAnimRef.current);
      replayAnimRef.current = null;
    }
    setReplayPlaying(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPageLabel = (path: string) => {
    if (path === '/' || path === '') return 'Homepage';
    if (path.includes('/products/')) return path.split('/products/')[1]?.replace(/-/g, ' ');
    if (path.includes('/collections/')) return 'Collection: ' + path.split('/collections/')[1]?.replace(/-/g, ' ');
    if (path.includes('/cart')) return 'Cart';
    if (path.includes('/checkout')) return 'Checkout';
    if (path.includes('/account')) return 'Account';
    return path.replace(/^\//, '').replace(/-/g, ' ');
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const seconds = s % 60;
    return `${m}:${seconds.toString().padStart(2, '0')}`;
  };

  const visitors = data?.visitors || [];
  const filteredVisitors = visitors.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (v.userName?.toLowerCase().includes(q) ||
      v.companyName?.toLowerCase().includes(q) ||
      v.userEmail?.toLowerCase().includes(q) ||
      v.currentPage?.path?.toLowerCase().includes(q));
  });

  const onlineVisitors = filteredVisitors.filter(v => v.status === 'online');
  const awayVisitors = filteredVisitors.filter(v => v.status === 'away');
  const identifiedVisitors = filteredVisitors.filter(v => v.isIdentified);
  const companies = [...new Set(filteredVisitors.filter(v => v.companyName).map(v => v.companyName))];

  return (
    <div>
      <PageHeader
        title="Live Visitors"
        subtitle={loading ? 'Loading...' : `${data?.totalOnline || 0} online now · ${data?.activeCompanyCount || 0} companies active`}
        actions={[
          { label: 'Refresh', icon: 'refresh', variant: 'secondary', onClick: fetchActive },
        ]}
      />

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <StatsCard
          title="Online Now" value={data?.totalOnline || 0}
          icon="antenna-bars-5" iconColor="success" loading={loading}
          meta={data?.totalOnline ? `${data.totalAway} away` : undefined}
        />
        <StatsCard
          title="Total Visitors" value={data?.totalVisitors || 0}
          icon="users" iconColor="primary" loading={loading}
        />
        <StatsCard
          title="Identified" value={data?.identifiedCount || 0}
          icon="user-check" iconColor="info" loading={loading}
        />
        <StatsCard
          title="Active Companies" value={data?.activeCompanyCount || 0}
          icon="building" iconColor="warning" loading={loading}
        />
        <StatsCard
          title="Anonymous" value={(data?.totalVisitors || 0) - (data?.identifiedCount || 0)}
          icon="user-question" iconColor="secondary" loading={loading}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'visitors', label: 'All Visitors', icon: 'users', count: filteredVisitors.length },
          { id: 'companies', label: 'Active Companies', icon: 'building', count: companies.length },
          { id: 'replay', label: 'Session Replay', icon: 'player-play' },
        ]}
        activeTab={tab}
        onChange={(id) => { setTab(id); if (id !== 'replay') stopReplay(); }}
      />

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search visitors, companies, pages..."
        />
      </div>

      {/* All Visitors Tab */}
      {tab === 'visitors' && (
        <div className="apple-card">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner-apple" />
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <div className="empty-state-icon"><i className="ti ti-antenna-bars-off" /></div>
              <h4 className="empty-state-title">No Active Visitors</h4>
              <p className="empty-state-description">Visitors will appear here in real-time as they browse your store.</p>
            </div>
          ) : (
            <div>
              {filteredVisitors.map((v) => (
                <div
                  key={v.sessionId}
                  className="active-user-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedVisitor(v);
                    setTab('replay');
                    loadReplay(v.sessionId);
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div
                      className="active-user-avatar"
                      style={v.isIdentified ? {} : { background: 'var(--text-quaternary)' }}
                    >
                      {getInitials(v.userName || v.userEmail)}
                    </div>
                    <span
                      className={`presence-dot ${v.status}`}
                      style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, border: '2px solid white' }}
                    />
                  </div>

                  <div className="active-user-info">
                    <div className="active-user-name">
                      {v.userName || v.userEmail || 'Anonymous Visitor'}
                      {v.companyName && (
                        <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                          @ {v.companyName}
                        </span>
                      )}
                    </div>
                    <div className="active-user-meta">
                      <i className="ti ti-device-desktop" style={{ fontSize: 12, marginRight: 4 }} />
                      {v.platform || 'Unknown'} · {v.viewport?.width}×{v.viewport?.height}
                      {v.secondsAgo > 0 && ` · ${v.secondsAgo}s ago`}
                    </div>
                  </div>

                  <span className="active-user-page">
                    <i className="ti ti-file" style={{ fontSize: 11, marginRight: 3 }} />
                    {getPageLabel(v.currentPage?.path || '')}
                  </span>

                  <div className="active-user-actions">
                    <button
                      className="btn-apple ghost sm"
                      title="Watch session"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVisitor(v);
                        setTab('replay');
                        loadReplay(v.sessionId);
                      }}
                    >
                      <i className="ti ti-eye" />
                    </button>
                    <button
                      className="btn-apple ghost sm"
                      title="Send push"
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast('Push marketing coming soon!', 'info');
                      }}
                    >
                      <i className="ti ti-send" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Companies Tab */}
      {tab === 'companies' && (
        <div>
          {companies.length === 0 ? (
            <div className="apple-card">
              <div className="empty-state" style={{ padding: 48 }}>
                <div className="empty-state-icon"><i className="ti ti-building" /></div>
                <h4 className="empty-state-title">No Active Companies</h4>
                <p className="empty-state-description">Companies will appear when their users browse your store.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {companies.map((companyName) => {
                const companyVisitors = filteredVisitors.filter(v => v.companyName === companyName);
                const onlineCount = companyVisitors.filter(v => v.status === 'online').length;
                return (
                  <div key={companyName} className="push-card">
                    <div className="push-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 600, fontSize: 14,
                          }}
                        >
                          {companyName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="push-card-title">{companyName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {companyVisitors.length} user{companyVisitors.length !== 1 ? 's' : ''} active
                          </div>
                        </div>
                      </div>
                      <span className={`presence-dot ${onlineCount > 0 ? 'online pulse-live' : 'away'}`} />
                    </div>
                    <div className="push-card-body">
                      {companyVisitors.map(v => (
                        <div key={v.sessionId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
                          <span className={`presence-dot ${v.status}`} />
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {v.userName || v.userEmail || 'Anonymous'}
                          </span>
                          <span style={{ color: 'var(--text-quaternary)', fontSize: 11, marginLeft: 'auto' }}>
                            {getPageLabel(v.currentPage?.path || '')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button className="btn-apple primary sm" onClick={() => showToast('Push discount coming soon!', 'info')}>
                        <i className="ti ti-discount" /> Push Discount
                      </button>
                      <button className="btn-apple secondary sm" onClick={() => showToast('Popup coming soon!', 'info')}>
                        <i className="ti ti-message-2" /> Send Popup
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Session Replay Tab */}
      {tab === 'replay' && (
        <div>
          {!replay ? (
            <div className="apple-card">
              <div className="empty-state" style={{ padding: 48 }}>
                <div className="empty-state-icon"><i className="ti ti-player-play" /></div>
                <h4 className="empty-state-title">Select a Visitor to Watch</h4>
                <p className="empty-state-description">Click on any active visitor to replay their mouse movements and interactions in real-time.</p>
              </div>
            </div>
          ) : (
            <div className="apple-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Session Info Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="active-user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {getInitials(replay.session?.userName)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {replay.session?.userName || 'Anonymous'}
                    {replay.session?.companyName && (
                      <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                        @ {replay.session.companyName}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {replay.session?.platform} · {replay.totalEvents} events · {formatDuration(replay.durationMs)}
                  </div>
                </div>
                <button
                  className="btn-apple ghost sm"
                  onClick={() => { setReplay(null); setSelectedVisitor(null); stopReplay(); }}
                >
                  <i className="ti ti-x" /> Close
                </button>
              </div>

              {/* Replay Canvas */}
              <div ref={replayRef} className="replay-container" style={{ margin: 16, aspectRatio: '16/9' }}>
                {replay.events.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-quaternary)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <i className="ti ti-mouse" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                      <span style={{ fontSize: 13 }}>No mouse data available for this session yet</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Cursor */}
                    <div
                      className="replay-cursor"
                      style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
                    />

                    {/* Click rings */}
                    {clickRings.map(ring => (
                      <div
                        key={ring.id}
                        className="replay-click-ring"
                        style={{ left: `${ring.x}%`, top: `${ring.y}%` }}
                      />
                    ))}

                    {/* Page URL overlay */}
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)', fontSize: 11, fontFamily: 'monospace',
                    }}>
                      {selectedVisitor?.currentPage?.url || replay.events[0]?.pageUrl || ''}
                    </div>
                  </>
                )}
              </div>

              {/* Replay Controls */}
              <div className="replay-controls">
                {replayPlaying ? (
                  <button className="replay-btn active" onClick={stopReplay}>
                    <i className="ti ti-player-pause" />
                  </button>
                ) : (
                  <button className="replay-btn" onClick={playReplay}>
                    <i className="ti ti-player-play" />
                  </button>
                )}

                <div className="replay-progress">
                  <div className="replay-progress-fill" style={{ width: `${replayProgress}%` }}>
                    <div className="replay-progress-thumb" />
                  </div>
                </div>

                <span className="replay-time">
                  {formatDuration(replay.durationMs * (replayProgress / 100))} / {formatDuration(replay.durationMs)}
                </span>

                <button
                  className="replay-btn"
                  title="Live view (auto-refresh)"
                  onClick={() => {
                    if (selectedVisitor) loadReplay(selectedVisitor.sessionId);
                  }}
                >
                  <i className="ti ti-refresh" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
