'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  lineItems: OrderItem[];
  totalPrice: number;
  createdAt: string;
}

// Reorder Button Component
interface ReorderButtonProps {
  order: Order;
  shopDomain: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function ReorderButton({ 
  order, 
  shopDomain,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className = ''
}: ReorderButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReorder = async () => {
    try {
      setIsProcessing(true);

      if (!shopDomain) {
        alert('Shop domain not found');
        return;
      }

      // Build cart URL with all items
      const variantIds = order.lineItems
        .filter(item => item.variantId)
        .map(item => `${item.variantId}:${item.quantity}`)
        .join(',');

      if (variantIds) {
        window.location.href = `https://${shopDomain}/cart/${variantIds}`;
      } else {
        alert('No items available for reorder');
      }
    } catch (err) {
      console.error('Reorder error:', err);
      alert('Failed to process reorder');
    } finally {
      setIsProcessing(false);
    }
  };

  const btnClass = variant === 'outline' 
    ? 'btn-outline-primary' 
    : variant === 'text' 
      ? 'btn-text-primary' 
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      type="button"
      className={`btn ${btnClass} ${sizeClass} ${className}`}
      onClick={handleReorder}
      disabled={isProcessing || order.lineItems.length === 0}
    >
      {isProcessing ? (
        <span className="spinner-border spinner-border-sm me-2"></span>
      ) : showIcon ? (
        <i className="ti ti-refresh me-1"></i>
      ) : null}
      Reorder
    </button>
  );
}

// Quick Reorder Panel - Shows recent orders for quick reordering
interface QuickReorderPanelProps {
  orders: Order[];
  shopDomain: string;
  maxItems?: number;
}

export function QuickReorderPanel({ orders, shopDomain, maxItems = 3 }: QuickReorderPanelProps) {
  const recentOrders = orders.slice(0, maxItems);

  if (recentOrders.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <i className="ti ti-history ti-2x text-muted mb-2"></i>
          <p className="text-muted mb-0">No recent orders to reorder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-refresh me-2"></i>
          Quick Reorder
        </h6>
      </div>
      <div className="card-body p-0">
        {recentOrders.map((order, index) => (
          <div 
            key={order.id} 
            className={`p-3 d-flex justify-content-between align-items-center ${index > 0 ? 'border-top' : ''}`}
          >
            <div>
              <div className="fw-semibold">Order #{order.orderNumber}</div>
              <div className="small text-muted">
                {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''} • {formatCurrency(order.totalPrice)}
              </div>
            </div>
            <ReorderButton 
              order={order} 
              shopDomain={shopDomain} 
              variant="outline" 
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Reorder Modal - Shows items before reordering
interface ReorderModalProps {
  order: Order;
  shopDomain: string;
  show: boolean;
  onClose: () => void;
}

export function ReorderModal({ order, shopDomain, show, onClose }: ReorderModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(order.lineItems.map(item => item.id))
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(order.lineItems.map(item => [item.id, item.quantity]))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!show) return null;

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, quantity) }));
  };

  const handleReorder = async () => {
    try {
      setIsProcessing(true);

      const selectedLineItems = order.lineItems.filter(item => selectedItems.has(item.id));
      
      const variantIds = selectedLineItems
        .filter(item => item.variantId)
        .map(item => `${item.variantId}:${quantities[item.id]}`)
        .join(',');

      if (variantIds) {
        window.location.href = `https://${shopDomain}/cart/${variantIds}`;
      } else {
        alert('No items selected for reorder');
      }
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTotal = order.lineItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price * quantities[item.id], 0);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="ti ti-refresh me-2"></i>
              Reorder from #{order.orderNumber}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-3">
              Select items and adjust quantities for your reorder
            </p>

            <div className="border rounded">
              {order.lineItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-3 d-flex align-items-center ${index > 0 ? 'border-top' : ''}`}
                >
                  <div className="form-check me-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      id={`item-${item.id}`}
                    />
                  </div>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="rounded me-3"
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <label htmlFor={`item-${item.id}`} className="fw-semibold mb-0 cursor-pointer">
                      {item.title}
                    </label>
                    {item.variantTitle && (
                      <div className="small text-muted">{item.variantTitle}</div>
                    )}
                    <div className="small text-muted">{formatCurrency(item.price)} each</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, quantities[item.id] - 1)}
                      disabled={!selectedItems.has(item.id)}
                    >
                      <i className="ti ti-minus"></i>
                    </button>
                    <span className="fw-semibold" style={{ minWidth: 30, textAlign: 'center' }}>
                      {quantities[item.id]}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, quantities[item.id] + 1)}
                      disabled={!selectedItems.has(item.id)}
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>
                  <div className="ms-3 text-end" style={{ minWidth: 80 }}>
                    <strong>
                      {formatCurrency(item.price * quantities[item.id])}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <div>
                <span className="text-muted">Selected: </span>
                <strong>{selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}</strong>
              </div>
              <div className="fs-5">
                <span className="text-muted">Total: </span>
                <strong>{formatCurrency(selectedTotal)}</strong>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleReorder}
              disabled={selectedItems.size === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="ti ti-shopping-cart me-1"></i>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single item reorder button
interface ReorderItemButtonProps {
  item: OrderItem;
  shopDomain: string;
  className?: string;
}

export function ReorderItemButton({ item, shopDomain, className = '' }: ReorderItemButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReorder = async () => {
    try {
      setIsProcessing(true);
      
      if (!item.variantId) {
        alert('Cannot reorder this item');
        return;
      }

      window.location.href = `https://${shopDomain}/cart/${item.variantId}:${item.quantity}`;
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-primary ${className}`}
      onClick={handleReorder}
      disabled={isProcessing || !item.variantId}
      title="Reorder this item"
    >
      {isProcessing ? (
        <span className="spinner-border spinner-border-sm"></span>
      ) : (
        <i className="ti ti-refresh"></i>
      )}
    </button>
  );
}

// Frequently ordered products section
interface FrequentlyOrderedProps {
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    variantTitle?: string;
    price: number;
    image?: string;
    orderCount: number;
    lastOrderedAt: string;
  }>;
  shopDomain: string;
  maxItems?: number;
}

export function FrequentlyOrdered({ items, shopDomain, maxItems = 4 }: FrequentlyOrderedProps) {
  const topItems = items.slice(0, maxItems);

  if (topItems.length === 0) {
    return null;
  }

  const addToCart = (variantId: string) => {
    window.location.href = `https://${shopDomain}/cart/${variantId}:1`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-star me-2"></i>
          Frequently Ordered
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {topItems.map((item) => (
            <div key={item.productId} className="col-md-6">
              <div className="d-flex align-items-center p-2 border rounded hover-shadow">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="rounded me-3"
                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                  />
                )}
                <div className="flex-grow-1 min-width-0">
                  <div className="fw-semibold text-truncate">{item.title}</div>
                  <div className="small text-muted">
                    Ordered {item.orderCount}x • {formatCurrency(item.price)}
                  </div>
                </div>
                {item.variantId && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => addToCart(item.variantId!)}
                  >
                    <i className="ti ti-plus"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
