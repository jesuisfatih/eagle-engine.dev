'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

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
                        <div className="btn-group">
                          <button
                            onClick={() => {
                              const modal = document.createElement('div');
                              modal.className = 'modal fade show d-block';
                              modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                              modal.innerHTML = `
                                <div class="modal-dialog">
                                  <div class="modal-content">
                                    <div class="modal-header">
                                      <h5 class="modal-title">Edit User Role</h5>
                                      <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                                    </div>
                                    <div class="modal-body">
                                      <select class="form-select" id="roleSelect">
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                                        <option value="buyer" ${user.role === 'buyer' ? 'selected' : ''}>Buyer</option>
                                        <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                                      </select>
                                    </div>
                                    <div class="modal-footer">
                                      <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                                      <button type="button" class="btn btn-primary" onclick="alert('Role updated'); this.closest('.modal').remove(); location.reload();">Save</button>
                                    </div>
                                  </div>
                                </div>
                              `;
                              document.body.appendChild(modal);
                            }}
                            className="btn btn-sm btn-icon btn-primary"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`${user.isActive ? 'Deactivate' : 'Activate'} this user?`)) {
                                alert(`User ${user.isActive ? 'deactivated' : 'activated'}`);
                                loadUsers();
                              }
                            }}
                            className={`btn btn-sm btn-icon ${user.isActive ? 'btn-warning' : 'btn-success'}`}
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
        </div>
      </div>

      {roleModal.show && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change User Role</h5>
                <button type="button" className="btn-close" onClick={() => setRoleModal({show: false, userId: ''})}></button>
              </div>
              <div className="modal-body">
                <select id="roleSelect" className="form-select">
                  <option value="buyer">Buyer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRoleModal({show: false, userId: ''})}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={() => {
                  const role = (document.getElementById('roleSelect') as HTMLSelectElement).value;
                  handleRoleChange(roleModal.userId, role);
                }}>Update Role</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: ''})}
          onConfirm={() => setResultModal({show: false, message: ''})}
          title={resultModal.message.includes('✅') ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.message.includes('✅') ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

