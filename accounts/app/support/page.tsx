'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  category?: string;
  replies?: Array<{
    id: string;
    message: string;
    isStaff: boolean;
    createdAt: string;
    authorName?: string;
  }>;
}

type TicketCategory = 'order' | 'quote' | 'billing' | 'product' | 'technical' | 'other';

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'other' as TicketCategory,
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
        setFormData({subject: '', message: '', priority: 'medium', category: 'other'});
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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { class: string; icon: string; label: string }> = {
      open: { class: 'bg-primary', icon: 'circle-dot', label: 'Open' },
      in_progress: { class: 'bg-warning', icon: 'loader', label: 'In Progress' },
      resolved: { class: 'bg-success', icon: 'check', label: 'Resolved' },
      closed: { class: 'bg-secondary', icon: 'x', label: 'Closed' },
    };
    return configs[status] || { class: 'bg-secondary', icon: 'circle', label: status };
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { class: string; icon: string }> = {
      low: { class: 'bg-info-subtle text-info', icon: 'arrow-down' },
      medium: { class: 'bg-primary-subtle text-primary', icon: 'minus' },
      high: { class: 'bg-warning-subtle text-warning', icon: 'arrow-up' },
      urgent: { class: 'bg-danger-subtle text-danger', icon: 'alert-triangle' },
    };
    return configs[priority] || { class: 'bg-secondary-subtle', icon: 'minus' };
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      order: 'shopping-cart',
      quote: 'file-invoice',
      billing: 'credit-card',
      product: 'package',
      technical: 'settings',
      other: 'help',
    };
    return icons[category || 'other'] || 'help';
  };

  // Filter tickets
  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  // Stats
  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const categories: Array<{ key: TicketCategory; label: string; icon: string }> = [
    { key: 'order', label: 'Order Issue', icon: 'shopping-cart' },
    { key: 'quote', label: 'Quote Request', icon: 'file-invoice' },
    { key: 'billing', label: 'Billing/Payment', icon: 'credit-card' },
    { key: 'product', label: 'Product Question', icon: 'package' },
    { key: 'technical', label: 'Technical Issue', icon: 'settings' },
    { key: 'other', label: 'Other', icon: 'help' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Help & Support</h4>
          <p className="mb-0 text-muted">Get help with your orders, quotes, or account</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Open Tickets</p>
                  <h3 className="mb-0">{stats.open}</h3>
                </div>
                <i className="ti ti-ticket fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">In Progress</p>
                  <h3 className="mb-0 text-warning">{stats.inProgress}</h3>
                </div>
                <i className="ti ti-loader fs-1 text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Resolved</p>
                  <h3 className="mb-0 text-success">{stats.resolved}</h3>
                </div>
                <i className="ti ti-check fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* New Ticket Form */}
        <div className="col-lg-5">
          <div className="card sticky-top" style={{ top: 80 }}>
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="ti ti-plus me-2"></i>New Support Request
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Category Selection */}
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <div className="row g-2">
                    {categories.map(cat => (
                      <div key={cat.key} className="col-6">
                        <div 
                          className={`card cursor-pointer ${formData.category === cat.key ? 'border-primary bg-primary-subtle' : ''}`}
                          onClick={() => setFormData(prev => ({...prev, category: cat.key}))}
                        >
                          <div className="card-body py-2 px-3 text-center">
                            <i className={`ti ti-${cat.icon} ${formData.category === cat.key ? 'text-primary' : 'text-muted'}`}></i>
                            <small className={`d-block ${formData.category === cat.key ? 'text-primary fw-semibold' : ''}`}>
                              {cat.label}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Need help soon</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="urgent">Urgent - Critical problem</option>
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
                  className="btn btn-primary w-100"
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

        {/* Tickets List */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Your Tickets</h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={loadTickets}
                disabled={loading}
              >
                <i className="ti ti-refresh me-1"></i>Refresh
              </button>
            </div>
            
            {/* Filters */}
            <div className="card-body border-bottom py-2">
              <div className="d-flex flex-wrap gap-2">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map(status => (
                  <button
                    key={status}
                    className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    {status !== 'all' && (
                      <span className="badge bg-white text-dark ms-1">
                        {tickets.filter(t => t.status === status).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Loading tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-ticket-off ti-3x text-muted mb-3"></i>
                  <h5>No tickets found</h5>
                  <p className="text-muted">
                    {filter === 'all' 
                      ? 'Submit a request using the form' 
                      : 'No tickets with this status'
                    }
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredTickets.map((ticket) => {
                    const statusConfig = getStatusConfig(ticket.status);
                    const priorityConfig = getPriorityConfig(ticket.priority);
                    
                    return (
                      <div 
                        key={ticket.id} 
                        className={`list-group-item list-group-item-action cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-light' : ''}`}
                        onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <i className={`ti ti-${getCategoryIcon(ticket.category)} text-muted`}></i>
                              <h6 className="mb-0">{ticket.subject}</h6>
                            </div>
                            <p className="text-muted small mb-2 text-truncate" style={{ maxWidth: '300px' }}>
                              {ticket.message}
                            </p>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                              <span className={`badge ${statusConfig.class}`}>
                                <i className={`ti ti-${statusConfig.icon} me-1`}></i>
                                {statusConfig.label}
                              </span>
                              <span className={`badge ${priorityConfig.class}`}>
                                <i className={`ti ti-${priorityConfig.icon} me-1`}></i>
                                {ticket.priority}
                              </span>
                              <small className="text-muted">
                                {formatRelativeTime(ticket.createdAt)}
                              </small>
                            </div>
                          </div>
                          <i className={`ti ti-chevron-${selectedTicket?.id === ticket.id ? 'up' : 'down'} text-muted`}></i>
                        </div>
                        
                        {/* Expanded Detail */}
                        {selectedTicket?.id === ticket.id && (
                          <div className="mt-3 pt-3 border-top">
                            <h6 className="small text-muted mb-2">Full Message:</h6>
                            <p className="mb-3">{ticket.message}</p>
                            
                            {ticket.replies && ticket.replies.length > 0 && (
                              <>
                                <h6 className="small text-muted mb-2">Replies:</h6>
                                <div className="d-flex flex-column gap-2">
                                  {ticket.replies.map(reply => (
                                    <div 
                                      key={reply.id} 
                                      className={`p-2 rounded ${reply.isStaff ? 'bg-primary-subtle' : 'bg-light'}`}
                                    >
                                      <div className="d-flex justify-content-between mb-1">
                                        <small className="fw-semibold">
                                          {reply.isStaff ? '🛡️ Support Team' : reply.authorName || 'You'}
                                        </small>
                                        <small className="text-muted">{formatRelativeTime(reply.createdAt)}</small>
                                      </div>
                                      <p className="mb-0 small">{reply.message}</p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            
                            <div className="mt-3 text-end">
                              <small className="text-muted">
                                Last updated: {formatRelativeTime(ticket.updatedAt)}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="ti ti-headset me-2"></i>Other Ways to Reach Us
          </h5>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: 50, height: 50 }}>
                  <i className="ti ti-mail fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Email</small>
                  <a href="mailto:support@eagledtfsupply.com" className="fw-semibold text-body">
                    support@eagledtfsupply.com
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white" style={{ width: 50, height: 50 }}>
                  <i className="ti ti-phone fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Phone</small>
                  <a href="tel:+18005550123" className="fw-semibold text-body">(800) 555-0123</a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-info d-flex align-items-center justify-content-center text-white" style={{ width: 50, height: 50 }}>
                  <i className="ti ti-clock fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Business Hours</small>
                  <span className="fw-semibold">Mon-Fri, 9AM-6PM EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="ti ti-help-circle me-2"></i>Frequently Asked Questions
          </h5>
        </div>
        <div className="card-body">
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  How do I track my order?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Go to the Orders page to view all your orders. Click on any order to see detailed tracking information including shipping status and estimated delivery date.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  How do I request a quote for bulk orders?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Visit the Quotes page and click "Request Quote". Fill in the product details, quantities, and any special requirements. Our team will review and respond within 24-48 hours.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  What are the payment terms for B2B accounts?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  We offer Net-30 payment terms for qualified B2B accounts. Contact our sales team to set up credit terms for your company.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                  How do I add team members to my company account?
                </button>
              </h2>
              <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Administrators can invite team members from the Team page. Click "Invite Member", enter their email, and select their role. They'll receive an invitation to join your company account.
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

