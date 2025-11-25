'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const companies = await fetch(`${API_URL}/api/v1/companies`).then(r => r.json());
      
      const allUsers: any[] = [];
      for (const company of companies) {
        if (company.users) {
          company.users.forEach((user: any) => {
            allUsers.push({
              ...user,
              companyName: company.name,
            });
          });
        }
      }
      setUsers(allUsers);
    } catch (err) {
      setUsers([]);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">All Users</h4>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <p className="text-muted mb-0">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                        <div className="small text-muted">{user.email}</div>
                      </td>
                      <td>{user.companyName}</td>
                      <td><span className="badge bg-label-info">{user.role}</span></td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-label-success' : 'bg-label-warning'}`}>
                          {user.isActive ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="small">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          <i className="ti ti-edit"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

