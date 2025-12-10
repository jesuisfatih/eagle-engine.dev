'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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
      const userId = localStorage.getItem('eagle_userId') || '';
      const response = await accountsFetch(`/api/v1/support-tickets?userId=${userId}`);
      
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
      const userId = localStorage.getItem('eagle_userId') || '';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      const response = await accountsFetch('/api/v1/support-tickets', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          userId,
          companyId,
        }),
      });
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Support request submitted successfully! We will get back to you soon.', type: 'success'});
        setFormData({subject: '', message: '', priority: 'MEDIUM'});
        loadTickets();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to submit support request'}`, type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to submit support request. Please try again.', type: 'error'});
    } finally {
      setSubmitting(false);
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
      <h4 className="fw-bold mb-4">Help & Support</h4>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Submit a Support Request</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Subject *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                    placeholder="Brief description of your issue"
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
                  <label className="form-label">Message *</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                    placeholder="Please describe your issue in detail..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !formData.subject || !formData.message}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-send me-1"></i>
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Tickets</h5>
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
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-4">
                  <i className="ti ti-ticket fs-1 text-muted d-block mb-2"></i>
                  <p className="text-muted mb-0">No support tickets yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 text-truncate" style={{maxWidth: '70%'}}>{ticket.subject}</h6>
                        <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`} style={{fontSize: '0.7rem'}}>
                          {ticket.priority}
                        </span>
                        <small className="text-muted">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Other Ways to Reach Us</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm bg-label-primary me-3">
                  <i className="ti ti-mail"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Email</small>
                  <span>support@eagledtfsupply.com</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm bg-label-success me-3">
                  <i className="ti ti-phone"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Phone</small>
                  <span>(800) 555-0123</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm bg-label-info me-3">
                  <i className="ti ti-clock"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Hours</small>
                  <span>Mon-Fri, 9AM-6PM EST</span>
                </div>
              </div>
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

