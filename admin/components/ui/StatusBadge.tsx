interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot';
  size?: 'sm' | 'md';
}

/**
 * Status color mapping
 */
const statusColors: Record<string, string> = {
  // Company statuses
  active: 'success',
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'secondary',
  
  // Order statuses
  paid: 'success',
  refunded: 'info',
  partially_refunded: 'info',
  authorized: 'warning',
  pending_payment: 'warning',
  voided: 'secondary',
  
  // Fulfillment statuses
  fulfilled: 'success',
  unfulfilled: 'warning',
  partial: 'info',
  
  // Quote statuses
  accepted: 'success',
  declined: 'danger',
  expired: 'secondary',
  
  // Generic
  true: 'success',
  false: 'danger',
  yes: 'success',
  no: 'danger',
  enabled: 'success',
  disabled: 'secondary',
  
  // Default
  default: 'secondary',
};

/**
 * Get status label (clean up for display)
 */
function getStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get color for status
 */
function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s/g, '_');
  return statusColors[normalizedStatus] || statusColors.default;
}

/**
 * Reusable Status Badge Component
 * Consistent status display across admin panel
 */
export default function StatusBadge({ 
  status, 
  variant = 'default',
  size = 'md' 
}: StatusBadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const sizeClass = size === 'sm' ? 'small' : '';

  if (variant === 'dot') {
    return (
      <span className={`d-inline-flex align-items-center gap-2 ${sizeClass}`}>
        <span 
          className={`badge badge-dot bg-${color}`}
          style={{ 
            width: size === 'sm' ? '6px' : '8px', 
            height: size === 'sm' ? '6px' : '8px', 
            borderRadius: '50%',
            display: 'inline-block',
          }}
        ></span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className={`badge bg-label-${color} ${sizeClass}`}>
      {label}
    </span>
  );
}
