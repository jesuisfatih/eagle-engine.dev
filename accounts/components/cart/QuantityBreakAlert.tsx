'use client';

import React from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { QuantityBreak } from '@/types';

// ============================================
// QUANTITY BREAK ALERT
// Shows "Add X more items for better pricing" message
// ============================================

interface QuantityBreakAlertProps {
  currentQuantity: number;
  currentPrice: number;
  nextBreak: {
    qty: number;
    price: number;
  };
  onAddMore?: () => void;
  onDismiss?: () => void;
  currency?: string;
}

export function QuantityBreakAlert({
  currentQuantity,
  currentPrice,
  nextBreak,
  onAddMore,
  onDismiss,
  currency = 'USD',
}: QuantityBreakAlertProps) {
  const additionalNeeded = nextBreak.qty - currentQuantity;
  const currentTotal = currentQuantity * currentPrice;
  const newTotal = nextBreak.qty * nextBreak.price;
  
  // Calculate potential savings
  // If user adds X more items at the new price, what do they save vs buying at current price?
  const totalAtCurrentPrice = nextBreak.qty * currentPrice;
  const potentialSavings = totalAtCurrentPrice - newTotal;
  const savingsPercent = ((currentPrice - nextBreak.price) / currentPrice) * 100;

  return (
    <div className="alert alert-warning border-warning mb-3">
      <div className="d-flex align-items-start">
        <div className="me-3">
          <span className="badge bg-warning text-dark rounded-circle p-2">
            <i className="ti ti-bolt ti-lg"></i>
          </span>
        </div>
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-1">
            Add {additionalNeeded} more for extra {formatPercent(savingsPercent)} off!
          </h6>
          <div className="mb-2">
            <div className="row small">
              <div className="col-6">
                <span className="text-muted">Current:</span>
                <div>{currentQuantity} × {formatCurrency(currentPrice, currency)} = <strong>{formatCurrency(currentTotal, currency)}</strong></div>
              </div>
              <div className="col-6">
                <span className="text-success">With {nextBreak.qty}+ items:</span>
                <div>{nextBreak.qty} × {formatCurrency(nextBreak.price, currency)} = <strong className="text-success">{formatCurrency(newTotal, currency)}</strong></div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success">
              <i className="ti ti-discount me-1"></i>
              Save {formatCurrency(potentialSavings, currency)}
            </span>
            {onAddMore && (
              <button 
                className="btn btn-sm btn-warning"
                onClick={onAddMore}
              >
                <i className="ti ti-plus me-1"></i>
                Add {additionalNeeded} More
              </button>
            )}
            {onDismiss && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={onDismiss}
              >
                No thanks
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CART QUANTITY OPTIMIZER
// Shows all potential savings opportunities in cart
// ============================================

interface CartItemForOptimization {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  quantityBreaks?: QuantityBreak[];
}

interface CartOptimizerProps {
  items: CartItemForOptimization[];
  onUpdateQuantity?: (itemId: string, newQty: number) => void;
  currency?: string;
}

export function CartOptimizer({
  items,
  onUpdateQuantity,
  currency = 'USD',
}: CartOptimizerProps) {
  // Find items that can benefit from quantity breaks
  const opportunities = items.map(item => {
    if (!item.quantityBreaks || item.quantityBreaks.length === 0) {
      return null;
    }

    const sortedBreaks = [...item.quantityBreaks].sort((a, b) => a.qty - b.qty);
    const nextBreak = sortedBreaks.find(b => b.qty > item.quantity);

    if (!nextBreak) return null;

    const additionalNeeded = nextBreak.qty - item.quantity;
    const currentTotal = item.quantity * item.unitPrice;
    const newTotal = nextBreak.qty * nextBreak.price;
    const totalAtCurrentPrice = nextBreak.qty * item.unitPrice;
    const potentialSavings = totalAtCurrentPrice - newTotal;

    // Only show if savings are significant (> $5 or > 5%)
    const savingsPercent = (potentialSavings / totalAtCurrentPrice) * 100;
    if (potentialSavings < 5 && savingsPercent < 5) return null;

    return {
      item,
      nextBreak,
      additionalNeeded,
      currentTotal,
      newTotal,
      potentialSavings,
      savingsPercent,
    };
  }).filter(Boolean);

  if (opportunities.length === 0) return null;

  const totalPotentialSavings = opportunities.reduce(
    (sum, opp) => sum + (opp?.potentialSavings || 0), 
    0
  );

  return (
    <div className="card border-warning mb-4">
      <div className="card-header bg-warning bg-opacity-10 border-warning">
        <div className="d-flex align-items-center">
          <i className="ti ti-bulb ti-lg text-warning me-2"></i>
          <div>
            <h6 className="mb-0">Savings Opportunities</h6>
            <small className="text-muted">
              You could save up to <strong className="text-success">{formatCurrency(totalPotentialSavings, currency)}</strong>
            </small>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {opportunities.map((opp) => opp && (
            <li key={opp.item.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{opp.item.title}</strong>
                  <div className="small text-muted">
                    Add {opp.additionalNeeded} more to get {formatCurrency(opp.nextBreak.price, currency)}/each
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-success mb-1">
                    Save {formatCurrency(opp.potentialSavings, currency)}
                  </span>
                  {onUpdateQuantity && (
                    <button 
                      className="btn btn-sm btn-outline-warning d-block"
                      onClick={() => onUpdateQuantity(opp.item.id, opp.nextBreak.qty)}
                    >
                      Add {opp.additionalNeeded}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================
// INLINE QUANTITY BREAK HINT
// Small hint shown next to quantity input
// ============================================

interface QuantityBreakHintProps {
  currentQuantity: number;
  breaks: QuantityBreak[];
  currentPrice: number;
  currency?: string;
}

export function QuantityBreakHint({
  currentQuantity,
  breaks,
  currentPrice,
  currency = 'USD',
}: QuantityBreakHintProps) {
  if (!breaks || breaks.length === 0) return null;

  const sortedBreaks = [...breaks].sort((a, b) => a.qty - b.qty);
  const nextBreak = sortedBreaks.find(b => b.qty > currentQuantity);

  if (!nextBreak) {
    // User is at highest break - show current tier
    const currentBreak = sortedBreaks.filter(b => b.qty <= currentQuantity).pop();
    if (currentBreak) {
      return (
        <small className="text-success d-block mt-1">
          <i className="ti ti-check me-1"></i>
          Volume discount applied!
        </small>
      );
    }
    return null;
  }

  const additionalNeeded = nextBreak.qty - currentQuantity;
  const savingsPerItem = currentPrice - nextBreak.price;

  return (
    <small className="text-warning d-block mt-1">
      <i className="ti ti-trending-down me-1"></i>
      Add {additionalNeeded} more for {formatCurrency(savingsPerItem, currency)} off each
    </small>
  );
}

// ============================================
// EXPORTS
// ============================================

export default QuantityBreakAlert;
