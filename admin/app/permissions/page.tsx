'use client';

export default function PermissionsPage() {
  const roles = [
    { name: 'Admin', permissions: ['all'] },
    { name: 'Manager', permissions: ['orders', 'approve', 'team'] },
    { name: 'Buyer', permissions: ['orders', 'cart'] },
    { name: 'Viewer', permissions: ['view'] },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Roles & Permissions</h4>

      <div className="row g-4">
        {roles.map((role) => (
          <div key={role.name} className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h6 className="card-title mb-0">{role.name}</h6>
                <button className="btn btn-sm btn-primary">Edit</button>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="badge bg-label-info">{perm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

