'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  companyId: string;
  companyName: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [roleModal, setRoleModal] = useState<{show: boolean; user: User | null; selectedRole: string}>({
    show: false, 
    user: null,
    selectedRole: ''
  });
  const [statusModal, setStatusModal] = useState<{show: boolean; user: User | null}>({
    show: false,
    user: null
  });
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
    show: false, 
    message: '',
    type: 'success'
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/companies');
      const companies = await response.json();
      
      const allUsers: User[] = [];
      for (const company of (Array.isArray(companies) ? companies : [])) {
        if (company.users) {
          company.users.forEach((user: any) => {
            allUsers.push({
              ...user,
              companyId: company.id,
              companyName: company.name,
            });
          });
        }
      }
      setUsers(allUsers);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleModal.user) return;
    
    try {
      setUpdating(true);
      const response = await adminFetch(`/api/v1/users/${roleModal.user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: roleModal.selectedRole }),
      });
      
      setRoleModal({show: false, user: null, selectedRole: ''});
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ User role updated successfully!', type: 'success'});
        loadUsers();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to update role'}`, type: 'error'});
      }
    } catch (err: any) {
      setRoleModal({show: false, user: null, selectedRole: ''});
      setResultModal({show: true, message: `❌ ${err.message || 'Failed to update role'}`, type: 'error'});
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!statusModal.user) return;
    
    try {
      setUpdating(true);
      const newStatus = !statusModal.user.isActive;
      
      const response = await adminFetch(`/api/v1/users/${statusModal.user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: newStatus }),
      });
      
      setStatusModal({show: false, user: null});
      
      if (response.ok) {
        setResultModal({
          show: true, 
          message: `✅ User ${newStatus ? 'activated' : 'deactivated'} successfully!`, 
          type: 'success'
        });
        loadUsers();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to update status'}`, type: 'error'});
      }
    } catch (err: any) {
      setStatusModal({show: false, user: null});
      setResultModal({show: true, message: `❌ ${err.message || 'Failed to update status'}`, type: 'error'});
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.companyName?.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-label-danger';
      case 'manager': return 'bg-label-warning';
      case 'buyer': return 'bg-label-info';
      case 'viewer': return 'bg-label-secondary';
      default: return 'bg-label-primary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Users</h4>
          <p className="mb-0 text-muted">{filteredUsers.length} of {users.length} users</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            style={{maxWidth: '250px'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={loadUsers} 
            className="btn btn-label-primary"
            disabled={loading}
          >
            <i className="ti ti-refresh me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
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
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <i className="ti ti-users fs-1 text-muted d-block mb-2"></i>
                        <p className="text-muted mb-0">
                          {searchQuery ? 'No users match your search' : 'No users found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                          <div className="small text-muted">{user.email}</div>
                        </td>
                        <td>{user.companyName}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.isActive ? 'bg-label-success' : 'bg-label-warning'}`}>
                            {user.isActive ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="small">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => setRoleModal({
                                show: true, 
                                user, 
                                selectedRole: user.role
                              })}
                              className="btn btn-sm btn-icon btn-label-primary"
                              title="Edit Role"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              onClick={() => setStatusModal({show: true, user})}
                              className={`btn btn-sm btn-icon ${user.isActive ? 'btn-label-warning' : 'btn-label-success'}`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              <i className={`ti ${user.isActive ? 'ti-user-off' : 'ti-user-check'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {roleModal.show && roleModal.user && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change User Role</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setRoleModal({show: false, user: null, selectedRole: ''})}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>{roleModal.user.firstName} {roleModal.user.lastName}</strong>
                  <br />
                  <small className="text-muted">{roleModal.user.email}</small>
                </p>
                <label className="form-label">Select New Role</label>
                <select 
                  className="form-select"
                  value={roleModal.selectedRole}
                  onChange={(e) => setRoleModal(prev => ({...prev, selectedRole: e.target.value}))}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="buyer">Buyer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setRoleModal({show: false, user: null, selectedRole: ''})}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleRoleChange}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {statusModal.show && statusModal.user && (
        <Modal
          show={statusModal.show}
          onClose={() => setStatusModal({show: false, user: null})}
          onConfirm={handleStatusToggle}
          title={statusModal.user.isActive ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${statusModal.user.isActive ? 'deactivate' : 'activate'} ${statusModal.user.firstName} ${statusModal.user.lastName}?`}
          confirmText={statusModal.user.isActive ? 'Deactivate' : 'Activate'}
          cancelText="Cancel"
          type={statusModal.user.isActive ? 'warning' : 'success'}
        />
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: '', type: 'success'})}
          onConfirm={() => setResultModal({show: false, message: '', type: 'success'})}
          title={resultModal.type === 'success' ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.type === 'success' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

