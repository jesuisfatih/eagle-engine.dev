'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const companyId = 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
      
      const response = await fetch(`${API_URL}/api/v1/companies/${companyId}/users`);
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Team Members</h4>
          <p className="mb-0 text-muted">{members.length} members</p>
        </div>
        <button onClick={loadMembers} className="btn btn-sm btn-primary">
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-users ti-3x text-muted mb-3"></i>
              <h5>No team members yet</h5>
              <p className="text-muted">Contact your administrator to invite team members</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="fw-semibold">{member.firstName} {member.lastName}</div>
                        <div className="small text-muted">{member.email}</div>
                      </td>
                      <td><span className="badge bg-label-info">{member.role}</span></td>
                      <td>
                        <span className={`badge ${member.isActive ? 'bg-label-success' : 'bg-label-warning'}`}>
                          {member.isActive ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="small">
                        {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

