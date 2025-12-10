'use client';

import { useState, useEffect } from 'react';
import InviteMemberModal from './components/InviteMemberModal';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Team Members</h4>
          <p className="mb-0 text-muted">{members.length} members</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <i className="ti ti-user-plus me-1"></i>Invite Member
          </button>
          <button onClick={loadMembers} className="btn btn-sm btn-icon btn-label-secondary">
            <i className="ti ti-refresh"></i>
          </button>
        </div>
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

