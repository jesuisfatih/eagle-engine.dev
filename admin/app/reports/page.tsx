'use client';

export default function ReportsPage() {
  const generateReport = async (type: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      
      // Fetch data
      let data: any[] = [];
      switch (type) {
        case 'sales':
          data = await fetch(`${API_URL}/api/v1/orders`).then(r => r.json());
          break;
        case 'customers':
          data = await fetch(`${API_URL}/api/v1/shopify-customers`).then(r => r.json());
          break;
        case 'inventory':
          data = await fetch(`${API_URL}/api/v1/catalog/products`).then(r => r.json());
          break;
        case 'pricing':
          data = await fetch(`${API_URL}/api/v1/pricing/rules`).then(r => r.json());
          break;
      }
      
      // Generate CSV
      const csv = JSON.stringify(data, null, 2);
      const blob = new Blob([csv], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString()}.json`;
      a.click();
      
      const modal = document.createElement('div');
      modal.className = 'modal fade show d-block';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">✅ Success</h5>
              <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
            </div>
            <div class="modal-body">${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully!</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } catch (err) {
      const modal = document.createElement('div');
      modal.className = 'modal fade show d-block';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">❌ Error</h5>
              <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
            </div>
            <div class="modal-body">Report generation failed</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
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

