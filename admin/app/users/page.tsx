'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';
import {
  PageHeader,
  PageContent,
  StatsCard,
  DataTable,
  type DataTableColumn,
  StatusBadge,
  showToast
} from '@/components/ui';

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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    recentLogins: 0,
  });
  
  const [roleModal, setRoleModal] = useState<{show: boolean; user: User | null; selectedRole: string}>({
    show: false, 
    user: null,
    selectedRole: ''
  });
  const [statusModal, setStatusModal] = useState<{show: boolean; user: User | null}>({
    show: false,
    user: null
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
          company.users.forEach((user: User) => {
            allUsers.push({
              ...user,
              companyId: company.id,
              companyName: company.name,
            });
          });
        }
      }
      setUsers(allUsers);
      
      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        total: allUsers.length,
        active: allUsers.filter(u => u.isActive).length,
        admins: allUsers.filter(u => u.role?.toLowerCase() === 'admin').length,
        recentLogins: allUsers.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > weekAgo).length,
      });
    } catch (err) {
      console.error('Load users error:', err);
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
        showToast('success', 'User role updated successfully!');
        loadUsers();
      } else {
        const error = await response.json().catch(() => ({}));
        showToast('error', error.message || 'Failed to update role');
      }
    } catch (err) {
      setRoleModal({show: false, user: null, selectedRole: ''});
      showToast('error', err instanceof Error ? err.message : 'Failed to update role');
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
        showToast('success', `User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        loadUsers();
      } else {
        const error = await response.json().catch(() => ({}));
        showToast('error', error.message || 'Failed to update status');
      }
    } catch (err) {
      setStatusModal({show: false, user: null});
      showToast('error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Table columns
  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (user) => (
        <div>
          <div className="fw-semibold">{user.firstName} {user.lastName}</div>
          <div className="small text-muted">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <StatusBadge
          status={user.role}
          colorMap={{
            admin: 'danger',
            manager: 'warning',
            buyer: 'info',
            viewer: 'secondary',
          }}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (user) => (
        <StatusBadge
          status={user.isActive ? 'Active' : 'Pending'}
          colorMap={{
            Active: 'success',
            Pending: 'warning',
          }}
        />
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      sortable: true,
      className: 'small',
      render: (user) => user.lastLoginAt 
        ? new Date(user.lastLoginAt).toLocaleDateString() 
        : 'Never',
    },
  ];

  // Row actions
  const rowActions = (user: User) => (
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
  );

  return (
    <div>
      <PageHeader
        title="All Users"
        subtitle={`${users.length} users across all companies`}
        actions={[
          {
            label: 'Refresh',
            icon: 'refresh',
            variant: 'secondary',
            onClick: loadUsers,
            disabled: loading,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon="users"
            iconColor="primary"
            loading={loading}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatsCard
            title="Active"
            value={stats.active}
            icon="user-check"
            iconColor="success"
            loading={loading}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatsCard
            title="Admins"
            value={stats.admins}
            icon="shield"
            iconColor="danger"
            loading={loading}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatsCard
            title="Recent Logins (7d)"
            value={stats.recentLogins}
            icon="clock"
            iconColor="info"
            loading={loading}
          />
        </div>
      </div>

      {/* Users Table */}
      <PageContent
        loading={loading}
        empty={{
          show: !loading && users.length === 0,
          icon: 'users',
          title: 'No users found',
          message: 'Users will appear here when companies are created.',
        }}
      >
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search users..."
          searchFields={['firstName', 'lastName', 'email', 'companyName']}
          statusFilter={{
            field: 'role',
            options: [
              { value: 'admin', label: 'Admin', color: 'danger' },
              { value: 'manager', label: 'Manager', color: 'warning' },
              { value: 'buyer', label: 'Buyer', color: 'info' },
              { value: 'viewer', label: 'Viewer', color: 'secondary' },
            ],
          }}
          defaultSortKey="lastName"
          defaultSortOrder="asc"
          rowActions={rowActions}
          emptyIcon="users"
          emptyTitle="No users found"
          emptyMessage="Try adjusting your search or filter criteria."
        />
      </PageContent>

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
    </div>
  );
}

