'use client';

interface InviteMemberModalProps {
  show: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}

export default function InviteMemberModal({ show, onClose, onInvite }: InviteMemberModalProps) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Invite Team Member</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="inviteEmail"
                placeholder="member@company.com"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" id="inviteRole">
                <option value="buyer">Buyer</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="alert alert-info small">
              <i className="ti ti-info-circle me-2"></i>
              Only administrators can invite members. Contact your admin if you need access.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const email = (document.getElementById('inviteEmail') as HTMLInputElement).value;
                const role = (document.getElementById('inviteRole') as HTMLSelectElement).value;
                if (email) {
                  onInvite(email, role);
                }
              }}
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

