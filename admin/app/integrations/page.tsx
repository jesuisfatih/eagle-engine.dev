'use client';

import { PageHeader } from '@/components/ui';

const integrations = [
  { name: 'Shopify', desc: 'E-commerce platform integration', icon: 'ti-brand-shopify', status: 'Connected', color: '#95bf47' },
  { name: 'Email Service', desc: 'Transactional email delivery', icon: 'ti-mail', status: 'Active', color: '#007aff' },
  { name: 'Redis Cache', desc: 'In-memory caching layer', icon: 'ti-bolt', status: 'Active', color: '#ff3b30' },
  { name: 'PostgreSQL', desc: 'Database connection', icon: 'ti-database', status: 'Connected', color: '#336791' },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrations" subtitle="Connected services and APIs" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {integrations.map(i => (
          <div key={i.name} className="apple-card">
            <div className="apple-card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${i.color}14`, color: i.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${i.icon}`} style={{ fontSize: 24 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{i.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{i.desc}</div>
              </div>
              <span className="badge-apple success">{i.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
