'use client';

export default function IntegrationsPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Integrations</h4>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar avatar-lg me-3">
                  <span className="avatar-initial rounded bg-label-success">
                    <i className="ti ti-brand-shopify ti-lg"></i>
                  </span>
                </div>
                <div>
                  <h5 className="mb-0">Shopify</h5>
                  <span className="badge bg-label-success">Connected</span>
                </div>
              </div>
              <p className="text-muted small mb-3">
                Store: eagle-dtf-supply0.myshopify.com
              </p>
              <div className="d-flex gap-2">
                <button
                  onClick={() => window.location.href = '/settings'}
                  className="btn btn-sm btn-primary"
                >
                  Configure
                </button>
                <button
                  onClick={() => {
                    if (confirm('Disconnect Shopify?')) {
                      alert('Disconnection feature - will stop sync');
                    }
                  }}
                  className="btn btn-sm btn-label-secondary"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar avatar-lg me-3">
                  <span className="avatar-initial rounded bg-label-info">
                    <i className="ti ti-mail ti-lg"></i>
                  </span>
                </div>
                <div>
                  <h5 className="mb-0">Email Service</h5>
                  <span className="badge bg-label-warning">Not Configured</span>
                </div>
              </div>
              <p className="text-muted small mb-3">
                Configure email service for invitations
              </p>
              <button
                onClick={() => {
                  const email = prompt('SMTP Server:');
                  if (email) alert('Email service setup - backend integration needed');
                }}
                className="btn btn-sm btn-primary"
              >
                Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

