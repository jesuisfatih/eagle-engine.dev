'use client';

export default function EmailTemplatesPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Email Templates</h4>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h6 className="card-title mb-0">Company Invitation</h6>
              <button className="btn btn-sm btn-primary">Edit</button>
            </div>
            <div className="card-body">
              <div className="bg-lighter p-3 rounded">
                <p className="small mb-0">
                  Subject: You're invited to join Eagle B2B<br/>
                  Body: Welcome! Click the link below to set up your account...
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h6 className="card-title mb-0">Order Confirmation</h6>
              <button className="btn btn-sm btn-primary">Edit</button>
            </div>
            <div className="card-body">
              <div className="bg-lighter p-3 rounded">
                <p className="small mb-0">
                  Subject: Order Confirmed<br/>
                  Body: Thank you for your order...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

