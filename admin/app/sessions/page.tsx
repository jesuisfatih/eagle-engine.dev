'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceLogoutModal, setForceLogoutModal] = useState<{show: boolean; sessionId: string}>({show: false, sessionId: ''});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/sessions`);
      
      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Load sessions error:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async (sessionId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      setForceLogoutModal({show: false, sessionId: ''});
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Session terminated successfully!'});
        loadSessions();
      } else {
        setResultModal({show: true, message: '❌ Failed to terminate session'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Error terminating session'});
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Active Sessions</h4>
          <p className="mb-0 text-muted">{sessions.length} active sessions</p>
        </div>
        <button onClick={loadSessions} className="btn btn-primary">
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-users-off ti-3x text-muted mb-3"></i>
              <h5>No active sessions</h5>
              <p className="text-muted">User sessions will appear here</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Last Activity</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.sessionId}>
                      <td className="fw-semibold">
                        {session.firstName} {session.lastName}
                      </td>
                      <td className="small">{session.email}</td>
                      <td>{session.companyName || '-'}</td>
                      <td>
                        <span className="badge bg-label-info small">
                          {session.device || 'Unknown'}
                        </span>
                      </td>
                      <td className="small">{session.ipAddress || '-'}</td>
                      <td className="small">
                        {new Date(session.lastActivity).toLocaleString()}
                      </td>
                      <td className="small">
                        {Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)} min
                      </td>
                      <td>
                        <button
                          onClick={() => setForceLogoutModal({show: true, sessionId: session.sessionId})}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="ti ti-logout"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {forceLogoutModal.show && (
        <Modal
          show={forceLogoutModal.show}
          onClose={() => setForceLogoutModal({show: false, sessionId: ''})}
          onConfirm={() => forceLogout(forceLogoutModal.sessionId)}
          title="Force Logout"
          message="Are you sure you want to terminate this session?"
          confirmText="Terminate"
          cancelText="Cancel"
          type="danger"
        />
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

