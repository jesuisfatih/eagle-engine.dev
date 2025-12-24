'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

// Role types
export type TeamRole = 'owner' | 'admin' | 'manager' | 'buyer' | 'viewer';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: TeamRole;
  status: 'active' | 'pending' | 'inactive';
  spendingLimit?: number;
  monthlySpent?: number;
  lastActiveAt?: string;
  createdAt: string;
  permissions?: TeamPermissions;
}

interface TeamPermissions {
  canViewPrices: boolean;
  canPlaceOrders: boolean;
  canApproveOrders: boolean;
  canManageTeam: boolean;
  canViewReports: boolean;
  canRequestQuotes: boolean;
  canManageAddresses: boolean;
  canViewAllOrders: boolean;
}

// Team Members List
interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  onInvite: () => void;
  onEdit: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
  isLoading?: boolean;
}

export function TeamMembersList({ 
  members, 
  currentUserId,
  onInvite, 
  onEdit, 
  onRemove,
  onResendInvite,
  isLoading = false 
}: TeamMembersListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const filteredMembers = members.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const roleConfig = getRoleConfig;

  return (
    <div className="team-members-list">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Team Members</h5>
          <p className="text-muted mb-0">
            {members.length} member{members.length !== 1 ? 's' : ''} • 
            {members.filter(m => m.status === 'active').length} active
          </p>
        </div>
        <button className="btn btn-primary" onClick={onInvite}>
          <i className="ti ti-user-plus me-1"></i>
          Invite Member
        </button>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4">
        {(['all', 'active', 'pending'] as const).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-5">
          <i className="ti ti-users-group ti-3x text-muted mb-3"></i>
          <h5>No team members</h5>
          <p className="text-muted">Invite team members to get started</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Spending Limit</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => {
                  const role = roleConfig(member.role);
                  const isCurrentUser = member.userId === currentUserId;
                  const spendingPercent = member.spendingLimit && member.monthlySpent
                    ? (member.monthlySpent / member.spendingLimit) * 100
                    : 0;

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                            style={{ width: 40, height: 40 }}
                          >
                            {(member.firstName?.[0] || member.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {member.firstName && member.lastName 
                                ? `${member.firstName} ${member.lastName}`
                                : member.email
                              }
                              {isCurrentUser && (
                                <span className="badge bg-info ms-2 small">You</span>
                              )}
                            </div>
                            <div className="small text-muted">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${role.class}`}>
                          <i className={`ti ti-${role.icon} me-1`}></i>
                          {role.label}
                        </span>
                      </td>
                      <td>
                        {member.spendingLimit ? (
                          <div>
                            <div className="small text-muted">
                              {formatCurrency(member.monthlySpent || 0)} / {formatCurrency(member.spendingLimit)}
                            </div>
                            <div className="progress" style={{ height: 4 }}>
                              <div 
                                className={`progress-bar ${spendingPercent > 80 ? 'bg-danger' : spendingPercent > 50 ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${Math.min(spendingPercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Unlimited</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          member.status === 'active' ? 'bg-success' :
                          member.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {member.lastActiveAt 
                          ? formatRelativeTime(member.lastActiveAt)
                          : 'Never'
                        }
                      </td>
                      <td className="text-end">
                        {member.status === 'pending' && onResendInvite && (
                          <button
                            className="btn btn-sm btn-text-primary me-1"
                            onClick={() => onResendInvite(member.id)}
                            title="Resend invite"
                          >
                            <i className="ti ti-send"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-text-primary me-1"
                          onClick={() => onEdit(member)}
                          title="Edit"
                        >
                          <i className="ti ti-edit"></i>
                        </button>
                        {!isCurrentUser && (
                          <button
                            className="btn btn-sm btn-text-danger"
                            onClick={() => onRemove(member.id)}
                            title="Remove"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Invite Member Form
interface InviteMemberFormProps {
  onSubmit: (data: InviteMemberData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface InviteMemberData {
  email: string;
  role: TeamRole;
  firstName?: string;
  lastName?: string;
  spendingLimit?: number;
  permissions?: Partial<TeamPermissions>;
}

export function InviteMemberForm({ onSubmit, onCancel, isSubmitting = false }: InviteMemberFormProps) {
  const [formData, setFormData] = useState<InviteMemberData>({
    email: '',
    role: 'buyer',
    firstName: '',
    lastName: '',
    spendingLimit: undefined,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [permissions, setPermissions] = useState<TeamPermissions>({
    canViewPrices: true,
    canPlaceOrders: true,
    canApproveOrders: false,
    canManageTeam: false,
    canViewReports: false,
    canRequestQuotes: true,
    canManageAddresses: false,
    canViewAllOrders: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      permissions: showAdvanced ? permissions : undefined,
    });
  };

  const roles: Array<{ value: TeamRole; label: string; description: string }> = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'manager', label: 'Manager', description: 'Can approve orders and manage buyers' },
    { value: 'buyer', label: 'Buyer', description: 'Can place orders within limits' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.firstName}
            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.lastName}
            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
          />
        </div>
        <div className="col-12">
          <label className="form-label">Email Address <span className="text-danger">*</span></label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@company.com"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Role <span className="text-danger">*</span></label>
          <select
            className="form-select"
            value={formData.role}
            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as TeamRole }))}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label} - {role.description}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Monthly Spending Limit</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className="form-control"
              value={formData.spendingLimit || ''}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                spendingLimit: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="No limit"
              min="0"
              step="100"
            />
          </div>
          <small className="text-muted">Leave empty for unlimited</small>
        </div>

        {/* Advanced Permissions */}
        <div className="col-12">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <i className={`ti ti-chevron-${showAdvanced ? 'up' : 'down'} me-1`}></i>
            {showAdvanced ? 'Hide' : 'Show'} Advanced Permissions
          </button>
        </div>

        {showAdvanced && (
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="mb-3">Custom Permissions</h6>
                <div className="row g-3">
                  {Object.entries(permissions).map(([key, value]) => (
                    <div key={key} className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={key}
                          checked={value}
                          onChange={e => setPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor={key}>
                          {formatPermissionLabel(key)}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || !formData.email}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Sending Invite...
            </>
          ) : (
            <>
              <i className="ti ti-send me-1"></i>
              Send Invitation
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Role Badge Component
interface RoleBadgeProps {
  role: TeamRole;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const config = getRoleConfig(role);
  const sizeClass = size === 'sm' ? 'small' : size === 'lg' ? 'fs-6' : '';
  
  return (
    <span className={`badge ${config.class} ${sizeClass}`}>
      <i className={`ti ti-${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
}

// Spending Limit Progress
interface SpendingLimitProgressProps {
  spent: number;
  limit: number;
  showAmount?: boolean;
  className?: string;
}

export function SpendingLimitProgress({ spent, limit, showAmount = true, className = '' }: SpendingLimitProgressProps) {
  const percentage = (spent / limit) * 100;
  const isOverLimit = percentage > 100;
  const isNearLimit = percentage > 80;

  return (
    <div className={className}>
      {showAmount && (
        <div className="d-flex justify-content-between small mb-1">
          <span>{formatCurrency(spent)} spent</span>
          <span className="text-muted">{formatCurrency(limit)} limit</span>
        </div>
      )}
      <div className="progress" style={{ height: 8 }}>
        <div 
          className={`progress-bar ${isOverLimit ? 'bg-danger' : isNearLimit ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {isNearLimit && !isOverLimit && (
        <small className="text-warning">
          <i className="ti ti-alert-triangle me-1"></i>
          {(100 - percentage).toFixed(0)}% remaining
        </small>
      )}
      {isOverLimit && (
        <small className="text-danger">
          <i className="ti ti-alert-circle me-1"></i>
          Limit exceeded by {formatCurrency(spent - limit)}
        </small>
      )}
    </div>
  );
}

// Team Activity Feed
interface TeamActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

interface TeamActivityFeedProps {
  activities: TeamActivity[];
  maxItems?: number;
}

export function TeamActivityFeed({ activities, maxItems = 10 }: TeamActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-activity me-2"></i>
          Team Activity
        </h6>
      </div>
      <div className="card-body p-0">
        {displayActivities.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">No recent activity</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {displayActivities.map(activity => (
              <div key={activity.id} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{activity.userName}</strong>{' '}
                    <span className="text-muted">{activity.action}</span>
                    {activity.details && (
                      <span className="text-muted"> - {activity.details}</span>
                    )}
                  </div>
                  <small className="text-muted">{formatRelativeTime(activity.timestamp)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getRoleConfig(role: TeamRole) {
  const configs: Record<TeamRole, { label: string; class: string; icon: string }> = {
    owner: { label: 'Owner', class: 'bg-dark', icon: 'crown' },
    admin: { label: 'Admin', class: 'bg-danger', icon: 'shield' },
    manager: { label: 'Manager', class: 'bg-warning', icon: 'users' },
    buyer: { label: 'Buyer', class: 'bg-primary', icon: 'shopping-cart' },
    viewer: { label: 'Viewer', class: 'bg-secondary', icon: 'eye' },
  };
  return configs[role];
}

function formatPermissionLabel(key: string): string {
  const labels: Record<string, string> = {
    canViewPrices: 'View Prices',
    canPlaceOrders: 'Place Orders',
    canApproveOrders: 'Approve Orders',
    canManageTeam: 'Manage Team',
    canViewReports: 'View Reports',
    canRequestQuotes: 'Request Quotes',
    canManageAddresses: 'Manage Addresses',
    canViewAllOrders: 'View All Orders',
  };
  return labels[key] || key;
}
