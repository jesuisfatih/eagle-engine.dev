'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('buyer');

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const [companyData, usersData] = await Promise.all([
        fetch(`${API_URL}/api/v1/companies/${params.id}`).then(r => r.json()),
        fetch(`${API_URL}/api/v1/companies/${params.id}/users`).then(r => r.json()),
      ]);
      setCompany(companyData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      await fetch(`${API_URL}/api/v1/companies/${params.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setShowInviteModal(false);
      setInviteEmail('');
      loadCompany();
      alert('✅ Invitation sent!');
    } catch (err) {
      alert('❌ Error sending invitation');
    }
  };

  const approveCompany = async () => {
    if (!confirm('Approve this company?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/companies/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      
      if (response.ok) {
        alert('✅ Company approved!');
        loadCompany();
      } else {
        alert('❌ Failed to approve');
      }
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!company) {
    return <div className="alert alert-danger">Company not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/companies">Companies</Link></li>
          <li className="breadcrumb-item active">{company.name}</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">{company.name}</h4>
          <p className="mb-0 text-muted">{company.email}</p>
        </div>
        <div className="dropdown">
          <button
            className="btn btn-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="ti ti-dots-vertical"></i> Actions
          </button>
          <ul className="dropdown-menu">
            {company.status === 'pending' && (
              <li>
                <a className="dropdown-item" href="javascript:void(0);" onClick={approveCompany}>
                  <i className="ti ti-check me-2"></i>
                  Approve Company
                </a>
              </li>
            )}
            <li>
              <a className="dropdown-item" href="javascript:void(0);">
                <i className="ti ti-edit me-2"></i>
                Edit Company Info
              </a>
            </li>
            <li>
              <a className="dropdown-item text-danger" href="javascript:void(0);">
                <i className="ti ti-trash me-2"></i>
                Delete Company
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Company Info */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Company Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Company Name</label>
                  <p className="fw-semibold">{company.name}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Status</label>
                  <p>
                    <span className={`badge ${company.status === 'active' ? 'bg-label-success' : 'bg-label-warning'}`}>
                      {company.status}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Email</label>
                  <p className="fw-semibold">{company.email || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Phone</label>
                  <p className="fw-semibold">{company.phone || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Tax ID</label>
                  <p className="fw-semibold">{company.taxId || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Company Group</label>
                  <p className="fw-semibold">{company.companyGroup || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Quick Stats</h6>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Team Members</span>
                  <span className="fw-bold">{users.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Orders</span>
                  <span className="fw-bold">0</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Spent</span>
                  <span className="fw-bold">$0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Team Members</h5>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-sm btn-primary"
          >
            <i className="ti ti-user-plus me-1"></i>
            Invite User
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <p className="text-muted mb-0">No team members yet</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                        <div className="small text-muted">{user.email}</div>
                      </td>
                      <td>
                        <span className="badge bg-label-info">{user.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-label-success' : 'bg-label-warning'}`}>
                          {user.isActive ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-icon btn-text-secondary">
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

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invite Team Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@company.com"
                  />
                  <small className="text-muted">
                    User will receive an invitation email to set up their account
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">Admin (Full access)</option>
                    <option value="manager">Manager (Manage orders, approve)</option>
                    <option value="buyer">Buyer (Create orders)</option>
                    <option value="viewer">Viewer (Read only)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-label-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInviteUser}
                  disabled={!inviteEmail}
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

