'use client';

import { useState, useEffect } from 'react';
import InviteMemberModal from './components/InviteMemberModal';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { User } from '@eagle/types';
import { RoleBadge, SpendingLimitProgress } from '@/components/team';

interface TeamMember extends User {
  spendingLimit?: number;
  spendingUsed?: number;
  permissions?: string[];
  invitedBy?: string;
  orderCount?: number;
  totalSpent?: number;
}

type RoleFilter = 'all' | 'ADMIN' | 'MANAGER' | 'BUYER' | 'VIEWER';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  const handleInvite = async (email: string, role: string) => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      const response = await accountsFetch(`/api/v1/companies/${companyId}/users`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      
      setShowInviteModal(false);
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Invitation sent successfully!'});
        loadMembers();
      } else {
        setResultModal({show: true, message: '❌ Failed to send invitation'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to send invitation'});
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      const response = await accountsFetch(`/api/v1/companies/${companyId}/users`);
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const response = await accountsFetch(`/api/v1/companies/${companyId}/users/${memberId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        setSelectedMember(null);
        setResultModal({show: true, message: '✅ Member removed successfully'});
      } else {
        setResultModal({show: true, message: '❌ Failed to remove member'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to remove member'});
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const response = await accountsFetch(`/api/v1/companies/${companyId}/users/resend-invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Invitation resent successfully'});
      } else {
        setResultModal({show: true, message: '❌ Failed to resend invitation'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to resend invitation'});
    }
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesSearch = searchQuery === '' || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Stats
  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    pending: members.filter(m => !m.isActive).length,
    admins: members.filter(m => m.role === 'ADMIN').length,
    totalSpent: members.reduce((acc, m) => acc + (m.totalSpent || 0), 0),
  };

  const roleFilters: Array<{ key: RoleFilter; label: string }> = [
    { key: 'all', label: 'All Members' },
    { key: 'ADMIN', label: 'Admins' },
    { key: 'MANAGER', label: 'Managers' },
    { key: 'BUYER', label: 'Buyers' },
    { key: 'VIEWER', label: 'Viewers' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Team Management</h4>
          <p className="mb-0 text-muted">Manage your team members and their permissions</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <i className="ti ti-user-plus me-1"></i>Invite Member
          </button>
          <button onClick={loadMembers} className="btn btn-icon btn-outline-secondary" title="Refresh">
            <i className="ti ti-refresh"></i>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Members</p>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <i className="ti ti-users fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Active</p>
                  <h3 className="mb-0 text-success">{stats.active}</h3>
                </div>
                <i className="ti ti-user-check fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Pending</p>
                  <h3 className="mb-0 text-warning">{stats.pending}</h3>
                </div>
                <i className="ti ti-user-exclamation fs-1 text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Team Spending</p>
                  <h3 className="mb-0">{formatCurrency(stats.totalSpent)}</h3>
                </div>
                <i className="ti ti-cash fs-1 text-info opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          {roleFilters.map(f => (
            <button
              key={f.key}
              className={`btn btn-sm ${roleFilter === f.key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRoleFilter(f.key)}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="badge bg-white text-dark ms-1">
                  {members.filter(m => m.role === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-grow-1">
          <div className="input-group input-group-sm">
            <span className="input-group-text"><i className="ti ti-search"></i></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Members List */}
        <div className={selectedMember ? 'col-md-8' : 'col-12'}>
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Loading team members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-users-group ti-3x text-muted mb-3"></i>
                  <h5>No team members found</h5>
                  <p className="text-muted mb-3">
                    {searchQuery || roleFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Start by inviting your first team member'
                    }
                  </p>
                  {!searchQuery && roleFilter === 'all' && (
                    <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                      <i className="ti ti-user-plus me-1"></i>Invite Member
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Spending</th>
                        <th>Last Activity</th>
                        <th width="50"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <tr 
                          key={member.id} 
                          className={`cursor-pointer ${selectedMember?.id === member.id ? 'table-active' : ''}`}
                          onClick={() => setSelectedMember(member)}
                        >
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div 
                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ width: 40, height: 40, fontSize: 14 }}
                              >
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </div>
                              <div>
                                <div className="fw-semibold">{member.firstName} {member.lastName}</div>
                                <div className="small text-muted">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <RoleBadge role={member.role as any} />
                          </td>
                          <td>
                            <span className={`badge ${member.isActive ? 'bg-success' : 'bg-warning'}`}>
                              {member.isActive ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            {member.spendingLimit ? (
                              <SpendingLimitProgress 
                                used={member.spendingUsed || 0} 
                                limit={member.spendingLimit} 
                                compact
                              />
                            ) : (
                              <span className="text-muted small">No limit</span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {member.lastLoginAt 
                              ? formatRelativeTime(member.lastLoginAt)
                              : 'Never logged in'
                            }
                          </td>
                          <td>
                            <div className="dropdown">
                              <button 
                                className="btn btn-sm btn-icon btn-text-secondary"
                                data-bs-toggle="dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="ti ti-dots-vertical"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}>
                                    <i className="ti ti-eye me-2"></i>View Details
                                  </button>
                                </li>
                                {!member.isActive && (
                                  <li>
                                    <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleResendInvite(member.email); }}>
                                      <i className="ti ti-mail-forward me-2"></i>Resend Invite
                                    </button>
                                  </li>
                                )}
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id); }}
                                  >
                                    <i className="ti ti-user-minus me-2"></i>Remove Member
                                  </button>
                                </li>
                              </ul>
                            </div>
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

        {/* Member Detail Sidebar */}
        {selectedMember && (
          <div className="col-md-4">
            <div className="card sticky-top" style={{ top: 80 }}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Member Details</h6>
                <button className="btn btn-sm btn-icon btn-text-secondary" onClick={() => setSelectedMember(null)}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
              <div className="card-body">
                {/* Avatar & Basic Info */}
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                    style={{ width: 80, height: 80, fontSize: 28 }}
                  >
                    {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                  </div>
                  <h5 className="mb-1">{selectedMember.firstName} {selectedMember.lastName}</h5>
                  <p className="text-muted mb-2">{selectedMember.email}</p>
                  <RoleBadge role={selectedMember.role as any} />
                </div>

                {/* Stats */}
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <div className="bg-light rounded p-3 text-center">
                      <h4 className="mb-0">{selectedMember.orderCount || 0}</h4>
                      <small className="text-muted">Orders</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded p-3 text-center">
                      <h4 className="mb-0">{formatCurrency(selectedMember.totalSpent || 0)}</h4>
                      <small className="text-muted">Total Spent</small>
                    </div>
                  </div>
                </div>

                {/* Spending Limit */}
                {selectedMember.spendingLimit && (
                  <div className="mb-4">
                    <h6 className="mb-2">Spending Limit</h6>
                    <SpendingLimitProgress 
                      used={selectedMember.spendingUsed || 0} 
                      limit={selectedMember.spendingLimit} 
                    />
                  </div>
                )}

                {/* Details List */}
                <ul className="list-unstyled small">
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Status</span>
                    <span className={`badge ${selectedMember.isActive ? 'bg-success' : 'bg-warning'}`}>
                      {selectedMember.isActive ? 'Active' : 'Pending'}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Joined</span>
                    <span>{selectedMember.createdAt ? formatRelativeTime(selectedMember.createdAt) : 'N/A'}</span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Last Login</span>
                    <span>{selectedMember.lastLoginAt ? formatRelativeTime(selectedMember.lastLoginAt) : 'Never'}</span>
                  </li>
                  {selectedMember.invitedBy && (
                    <li className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">Invited by</span>
                      <span>{selectedMember.invitedBy}</span>
                    </li>
                  )}
                </ul>

                {/* Actions */}
                <div className="d-grid gap-2 mt-4">
                  {!selectedMember.isActive && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => handleResendInvite(selectedMember.email)}
                    >
                      <i className="ti ti-mail-forward me-1"></i>Resend Invitation
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveMember(selectedMember.id)}
                  >
                    <i className="ti ti-user-minus me-1"></i>Remove from Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <InviteMemberModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

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

