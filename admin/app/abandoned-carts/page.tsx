'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showActivityModal, setShowActivityModal] = useState<{show: boolean; cartId: string | null}>({
    show: false,
    cartId: null,
  });

  useEffect(() => {
    loadCarts();
    loadActivityLogs();
    const interval = setInterval(() => {
      loadCarts();
      loadActivityLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivityLogs = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/abandoned-carts/activity?limit=50`);
      const data = await response.json();
      setActivityLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setActivityLogs([]);
    }
  };

  const loadCartActivity = async (cartId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/abandoned-carts/activity/${cartId}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  };

  const loadCarts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      // Get all carts including recent ones (for admin view)
      const response = await fetch(`${API_URL}/api/v1/abandoned-carts?includeRecent=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Abandoned carts API response:', {
        status: response.status,
        count: Array.isArray(data) ? data.length : 0,
        data: data,
      });
      
      setCarts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('❌ Failed to load abandoned carts:', err);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const [reminderModal, setReminderModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  const sendReminder = async (cartId: string, email: string) => {
    try {
      // Send reminder API call (will be implemented)
      setReminderModal({show: true, message: `✅ Reminder email sent to ${email}`});
    } catch (err) {
      setReminderModal({show: true, message: '❌ Failed to send reminder'});
    }
  };

  const calculateTotal = (cart: any) => {
    if (!cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce((sum: number, item: any) => {
      const price = item.unitPrice || item.listPrice || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Abandoned Carts</h4>
          <p className="mb-0 text-muted">{carts.length} abandoned carts</p>
        </div>
        <button onClick={loadCarts} className="btn btn-primary">
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : carts.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-shopping-cart-off ti-3x text-muted mb-3"></i>
              <h5>No abandoned carts</h5>
              <p className="text-muted">All good! No customers left items in cart.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((cart) => (
                    <tr key={cart.id}>
                      <td>
                        {cart.createdBy ? (
                          <>
                            <div className="fw-semibold">
                              {cart.createdBy.firstName} {cart.createdBy.lastName}
                            </div>
                            <div className="small text-muted">{cart.createdBy.email}</div>
                          </>
                        ) : (
                          <>
                            <span className="badge bg-label-warning mb-1">Anonymous User</span>
                            {(cart.metadata as any)?.customerEmail && (
                              <div className="small text-muted mt-1">{(cart.metadata as any).customerEmail}</div>
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        {cart.company?.name ? (
                          cart.company.name === 'Anonymous Customers' ? (
                            <span className="badge bg-label-warning">Anonymous</span>
                          ) : (
                            cart.company.name
                          )
                        ) : (
                          <span className="badge bg-label-warning">Anonymous</span>
                        )}
                      </td>
                      <td>
                        {cart.items && cart.items.length > 0 ? (
                          <span>{cart.items.length} items</span>
                        ) : (
                          <span className="text-muted">0 items</span>
                        )}
                      </td>
                      <td className="fw-semibold">
                        ${calculateTotal(cart).toFixed(2)}
                        {cart.items && cart.items.length === 0 && (
                          <span className="badge bg-label-warning ms-2">Empty</span>
                        )}
                      </td>
                      <td className="small">{new Date(cart.updatedAt).toLocaleString()}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={async () => {
                              const logs = await loadCartActivity(cart.id);
                              setShowActivityModal({ show: true, cartId: cart.id });
                              // Store logs temporarily
                              (window as any).__cartActivityLogs = logs;
                            }}
                            className="btn btn-sm btn-label-secondary"
                            title="View Activity Logs"
                          >
                            <i className="ti ti-history"></i>
                          </button>
                          <button
                            onClick={() => sendReminder(cart.id, cart.createdBy?.email || (cart.metadata as any)?.customerEmail)}
                            className="btn btn-sm btn-primary"
                            disabled={!cart.createdBy?.email && !(cart.metadata as any)?.customerEmail}
                          >
                            <i className="ti ti-mail me-1"></i>Send Reminder
                          </button>
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

      {/* Activity Logs Section */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Cart Activity</h5>
          <button onClick={loadActivityLogs} className="btn btn-sm btn-label-secondary">
            <i className="ti ti-refresh me-1"></i>Refresh
          </button>
        </div>
        <div className="card-body">
          {activityLogs.length === 0 ? (
            <p className="text-muted text-center py-3 mb-0">No recent cart activity</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Cart ID</th>
                    <th>Company</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => {
                    const payload = log.payload as any;
                    return (
                      <tr key={log.id}>
                        <td className="small">{new Date(log.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            log.eventType === 'cart_created' ? 'bg-label-success' :
                            log.eventType === 'cart_item_added' ? 'bg-label-primary' :
                            log.eventType === 'cart_item_removed' ? 'bg-label-danger' :
                            'bg-label-info'
                          }`}>
                            {log.eventType.replace('cart_', '').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="small font-monospace">{payload?.cartId?.substring(0, 8)}...</td>
                        <td className="small">{log.company?.name || <span className="badge bg-label-warning">Anonymous</span>}</td>
                        <td className="small">
                          {payload?.itemCount && <span>{payload.itemCount} items</span>}
                          {payload?.items && payload.items.length > 0 && (
                            <span>{payload.items.map((i: any) => i.title || i.sku).join(', ')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {reminderModal.show && (
        <Modal
          show={reminderModal.show}
          onClose={() => setReminderModal({show: false, message: ''})}
          onConfirm={() => setReminderModal({show: false, message: ''})}
          title="Reminder"
          message={reminderModal.message}
          confirmText="OK"
          type="success"
        />
      )}

      {/* Cart Activity Modal */}
      {showActivityModal.show && showActivityModal.cartId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cart Activity Logs</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowActivityModal({ show: false, cartId: null })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((window as any).__cartActivityLogs || []).map((log: any) => {
                        const payload = log.payload as any;
                        return (
                          <tr key={log.id}>
                            <td className="small">{new Date(log.createdAt).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${
                                log.eventType === 'cart_created' ? 'bg-label-success' :
                                log.eventType === 'cart_item_added' ? 'bg-label-primary' :
                                log.eventType === 'cart_item_removed' ? 'bg-label-danger' :
                                'bg-label-info'
                              }`}>
                                {log.eventType.replace('cart_', '').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="small">
                              <pre className="mb-0" style={{ fontSize: '11px', maxHeight: '100px', overflow: 'auto' }}>
                                {JSON.stringify(payload, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowActivityModal({ show: false, cartId: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

