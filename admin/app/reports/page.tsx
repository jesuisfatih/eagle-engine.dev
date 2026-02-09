'use client';

import { PageHeader } from '@/components/ui';

const reports = [
  { title: 'Sales Report', desc: 'Revenue, orders, and payment analytics', icon: 'ti-chart-bar', color: '#007aff' },
  { title: 'Customer Report', desc: 'Customer acquisition and activity', icon: 'ti-users', color: '#34c759' },
  { title: 'Inventory Report', desc: 'Stock levels and product performance', icon: 'ti-package', color: '#ff9500' },
  { title: 'Pricing Report', desc: 'Pricing rules and discount usage', icon: 'ti-discount', color: '#5856d6' },
];

export default function ReportsPage() {
  const handleGenerate = (title: string) => {
    alert(`Generating ${title}... This feature is coming soon.`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and download reports" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {reports.map(r => (
          <div key={r.title} className="apple-card">
            <div className="apple-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}14`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${r.icon}`} style={{ fontSize: 22 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{r.desc}</div>
                </div>
              </div>
              <button className="btn-apple primary" onClick={() => handleGenerate(r.title)}>
                <i className="ti ti-download" /> Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

