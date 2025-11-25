'use client';

import { useState } from 'react';

export default function TeamPage() {
  const [members] = useState<any[]>([]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Team Members</h4>
          <p className="mb-0 text-muted">Manage your company team</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <i className="ti ti-users ti-3x text-muted mb-3"></i>
            <h5>Team management</h5>
            <p className="text-muted">Contact your administrator to invite team members</p>
          </div>
        </div>
      </div>
    </div>
  );
}

