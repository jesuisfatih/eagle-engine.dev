'use client';

export default function ReportsPage() {
  const generateReport = (type: string) => {
    alert(`Generating ${type} report...`);
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Reports</h4>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Sales Report</h5>
              <p className="text-muted">Export detailed sales data</p>
              <button
                onClick={() => generateReport('sales')}
                className="btn btn-primary"
              >
                <i className="ti ti-download me-1"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Customer Report</h5>
              <p className="text-muted">Export customer data and activity</p>
              <button
                onClick={() => generateReport('customers')}
                className="btn btn-success"
              >
                <i className="ti ti-download me-1"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Inventory Report</h5>
              <p className="text-muted">Product stock levels and trends</p>
              <button
                onClick={() => generateReport('inventory')}
                className="btn btn-info"
              >
                <i className="ti ti-download me-1"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Pricing Report</h5>
              <p className="text-muted">Pricing rules effectiveness</p>
              <button
                onClick={() => generateReport('pricing')}
                className="btn btn-warning"
              >
                <i className="ti ti-download me-1"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

