'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId?: string;
  companyId?: string;
  companyName?: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/v1/support-tickets');
      
      if (response.ok) {
        const data = await response.json();
        setTickets(Array.isArray(data) ? data : data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      
      const response = await adminFetch('/api/v1/support-tickets', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          merchantId,
          isAdminTicket: true,
        }),
      });
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Support ticket created successfully!', type: 'success'});
        setFormData({subject: '', message: '', priority: 'MEDIUM'});
        loadTickets();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to create ticket'}`, type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to create ticket. Please try again.', type: 'error'});
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await adminFetch(`/api/v1/support-tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        loadTickets();
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-label-primary';
      case 'IN_PROGRESS': return 'bg-label-warning';
      case 'RESOLVED': return 'bg-label-success';
      case 'CLOSED': return 'bg-label-secondary';
      default: return 'bg-label-secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-label-info';
      case 'MEDIUM': return 'bg-label-primary';
      case 'HIGH': return 'bg-label-warning';
      case 'URGENT': return 'bg-label-danger';
      default: return 'bg-label-secondary';
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Support & Help</h4>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Create Support Ticket</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value as any}))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe your issue..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={submitting || !formData.subject || !formData.message}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-send me-1"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h6 className="mb-3">Quick Links</h6>
              <div className="d-grid gap-2">
                <a href="https://docs.eagledtfsupply.com" target="_blank" className="btn btn-label-primary">
                  <i className="ti ti-book me-2"></i>Documentation
                </a>
                <a href="https://help.eagledtfsupply.com" target="_blank" className="btn btn-label-success">
                  <i className="ti ti-video me-2"></i>Video Tutorials
                </a>
                <a href="mailto:support@eagledtfsupply.com" className="btn btn-label-info">
                  <i className="ti ti-mail me-2"></i>Email Support
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Customer Support Tickets</h6>
              <button 
                className="btn btn-sm btn-label-primary"
                onClick={loadTickets}
                disabled={loading}
              >
                <i className="ti ti-refresh me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-4">
                  <i className="ti ti-ticket fs-1 text-muted d-block mb-2"></i>
                  <p className="text-muted mb-0">No support tickets</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Company/User</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div className="fw-semibold">{ticket.subject}</div>
                            <div className="small text-muted text-truncate" style={{maxWidth: '200px'}}>
                              {ticket.message}
                            </div>
                          </td>
                          <td>
                            <div className="small">{ticket.companyName || 'N/A'}</div>
                            <div className="small text-muted">{ticket.userName || 'Admin'}</div>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="small">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={ticket.status}
                              onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                              style={{width: '130px'}}
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
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
      </div>

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

