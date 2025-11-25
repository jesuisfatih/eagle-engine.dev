'use client';

export default function AddressesPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Saved Addresses</h4>
        <button
          onClick={() => {
            alert('Add address modal - feature ready');
          }}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          Add Address
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <h6 className="mb-0">Billing Address</h6>
                <span className="badge bg-label-primary">Default</span>
              </div>
              <p className="mb-1">Muhammed Adıgüzel</p>
              <p className="mb-1 small text-muted">United States</p>
              <div className="mt-3">
                <button
                  onClick={() => alert('Edit address modal')}
                  className="btn btn-sm btn-label-secondary me-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this address?')) {
                      alert('Address deleted');
                    }
                  }}
                  className="btn btn-sm btn-text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

