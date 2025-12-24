'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  image?: string;
}

interface QuoteRequestFormProps {
  cartItems?: CartItem[];
  onSubmit: (data: QuoteFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface QuoteFormData {
  items: QuoteItemData[];
  notes: string;
  requestedDeliveryDate?: string;
  shippingAddressId?: string;
  contactEmail: string;
  contactPhone?: string;
  priority: 'normal' | 'urgent';
  attachments?: File[];
}

interface QuoteItemData {
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  requestedPrice?: number;
  notes?: string;
}

export function QuoteRequestForm({ 
  cartItems = [], 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: QuoteRequestFormProps) {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<QuoteItemData[]>(
    cartItems.map(item => ({
      productId: item.productId,
      title: item.title,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      requestedPrice: undefined,
      notes: ''
    }))
  );
  const [formData, setFormData] = useState({
    notes: '',
    requestedDeliveryDate: '',
    contactEmail: '',
    contactPhone: '',
    priority: 'normal' as const,
  });

  const addCustomItem = () => {
    setItems(prev => [...prev, {
      productId: `custom-${Date.now()}`,
      title: '',
      variantTitle: '',
      quantity: 1,
      requestedPrice: undefined,
      notes: ''
    }]);
  };

  const updateItem = (index: number, updates: Partial<QuoteItemData>) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    await onSubmit({
      items,
      notes: formData.notes,
      requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone || undefined,
      priority: formData.priority,
    });
  };

  const isStep1Valid = items.length > 0 && items.every(item => item.title && item.quantity > 0);
  const isStep2Valid = formData.contactEmail.includes('@');

  return (
    <div className="quote-request-form">
      {/* Progress Steps */}
      <div className="d-flex justify-content-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>
            1
          </div>
          <div className={`${step >= 2 ? 'bg-primary' : 'bg-light'}`} style={{ width: 40, height: 2 }}></div>
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>
            2
          </div>
          <div className={`${step >= 3 ? 'bg-primary' : 'bg-light'}`} style={{ width: 40, height: 2 }}></div>
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>
            3
          </div>
        </div>
      </div>

      {/* Step 1: Items */}
      {step === 1 && (
        <div>
          <h6 className="mb-3">
            <i className="ti ti-package me-2"></i>
            Items for Quote
          </h6>
          
          {items.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <i className="ti ti-package-off ti-2x text-muted mb-2"></i>
              <p className="text-muted mb-0">No items added yet</p>
            </div>
          ) : (
            <div className="border rounded mb-3">
              {items.map((item, index) => (
                <div key={index} className={`p-3 ${index > 0 ? 'border-top' : ''}`}>
                  <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label small">Product Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.title}
                        onChange={(e) => updateItem(index, { title: e.target.value })}
                        placeholder="Product name"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Variant</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.variantTitle || ''}
                        onChange={(e) => updateItem(index, { variantTitle: e.target.value })}
                        placeholder="Size/Color"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Quantity</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small">Target Price</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={item.requestedPrice || ''}
                        onChange={(e) => updateItem(index, { requestedPrice: parseFloat(e.target.value) || undefined })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => removeItem(index)}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, { notes: e.target.value })}
                      placeholder="Notes for this item (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={addCustomItem}
          >
            <i className="ti ti-plus me-1"></i>
            Add Item
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div>
          <h6 className="mb-3">
            <i className="ti ti-file-description me-2"></i>
            Quote Details
          </h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Contact Email <span className="text-danger">*</span></label>
              <input
                type="email"
                className="form-control"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Requested Delivery Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.requestedDeliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedDeliveryDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'normal' | 'urgent' }))}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent (Additional fees may apply)</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements, delivery instructions, or other notes..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <h6 className="mb-3">
            <i className="ti ti-checklist me-2"></i>
            Review Quote Request
          </h6>

          <div className="card bg-light mb-3">
            <div className="card-body">
              <h6 className="card-title">Items ({items.length})</h6>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Target Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.title}
                          {item.variantTitle && <span className="text-muted small"> - {item.variantTitle}</span>}
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          {item.requestedPrice ? formatCurrency(item.requestedPrice) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card bg-light h-100">
                <div className="card-body">
                  <h6 className="card-title">Contact</h6>
                  <p className="mb-1">{formData.contactEmail}</p>
                  {formData.contactPhone && <p className="mb-0 text-muted">{formData.contactPhone}</p>}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light h-100">
                <div className="card-body">
                  <h6 className="card-title">Delivery</h6>
                  <p className="mb-1">
                    {formData.requestedDeliveryDate 
                      ? new Date(formData.requestedDeliveryDate).toLocaleDateString()
                      : 'No specific date'
                    }
                  </p>
                  <span className={`badge ${formData.priority === 'urgent' ? 'bg-danger' : 'bg-secondary'}`}>
                    {formData.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {formData.notes && (
            <div className="card bg-light mt-3">
              <div className="card-body">
                <h6 className="card-title">Notes</h6>
                <p className="mb-0 text-muted">{formData.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        
        {step < 3 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
          >
            Next
            <i className="ti ti-arrow-right ms-1"></i>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="ti ti-send me-1"></i>
                Submit Quote Request
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Quick quote button for product pages
interface QuickQuoteButtonProps {
  productId: string;
  productTitle: string;
  variantTitle?: string;
  quantity?: number;
  className?: string;
}

export function QuickQuoteButton({ 
  productId, 
  productTitle, 
  variantTitle,
  quantity = 1,
  className = '' 
}: QuickQuoteButtonProps) {
  const handleClick = () => {
    // Store quote item in session and redirect
    const quoteItem = { productId, title: productTitle, variantTitle, quantity };
    sessionStorage.setItem('pendingQuoteItem', JSON.stringify(quoteItem));
    window.location.href = '/quotes?action=new';
  };

  return (
    <button
      type="button"
      className={`btn btn-outline-primary ${className}`}
      onClick={handleClick}
    >
      <i className="ti ti-file-invoice me-1"></i>
      Request Quote
    </button>
  );
}

// Quote items summary for display
interface QuoteItemsSummaryProps {
  items: QuoteItemData[];
  showPrices?: boolean;
}

export function QuoteItemsSummary({ items, showPrices = true }: QuoteItemsSummaryProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="quote-items-summary">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">Items</span>
        <span className="badge bg-primary">{items.length} products</span>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span className="text-muted">Total Quantity</span>
        <span className="fw-semibold">{totalQuantity} units</span>
      </div>
      {showPrices && items.some(i => i.requestedPrice) && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="text-muted">Target Total</span>
          <span className="fw-semibold">
            {formatCurrency(
              items.reduce((sum, item) => sum + (item.requestedPrice || 0) * item.quantity, 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
}
