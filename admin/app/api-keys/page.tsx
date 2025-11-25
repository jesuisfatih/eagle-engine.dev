'use client';

export default function ApiKeysPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">API Keys</h4>
          <p className="mb-0 text-muted">Manage API access</p>
        </div>
        <button
          onClick={() => {
            const keyName = prompt('API Key Name:');
            if (keyName) {
              const newKey = 'pk_live_' + Math.random().toString(36).substring(7);
              alert(`New API Key generated: ${newKey}`);
            }
          }}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          Generate Key
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="ti ti-alert-triangle me-2"></i>
            Keep your API keys secure. Never share them publicly.
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-semibold">Production Key</td>
                  <td><code className="small">pk_live_***************</code></td>
                  <td className="small">2025-11-25</td>
                  <td className="small">Never</td>
                  <td>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('pk_live_***************');
                        alert('✅ API Key copied!');
                      }}
                      className="btn btn-sm btn-text-secondary me-1"
                    >
                      <i className="ti ti-copy"></i>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this API key?')) {
                          alert('Key deleted');
                        }
                      }}
                      className="btn btn-sm btn-text-danger"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

