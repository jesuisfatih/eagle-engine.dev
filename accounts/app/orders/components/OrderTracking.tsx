'use client';

interface OrderData {
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
}

interface OrderTrackingProps {
  order: OrderData;
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const steps = [
    { name: 'Order Placed', completed: true, date: order.createdAt },
    { name: 'Processing', completed: order.financialStatus === 'paid', date: order.createdAt },
    { name: 'Shipped', completed: order.fulfillmentStatus === 'fulfilled', date: null },
    { name: 'Delivered', completed: false, date: null },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Order Tracking</h6>
      </div>
      <div className="card-body">
        <div className="timeline">
          {steps.map((step, i) => (
            <div key={i} className={`timeline-item ${step.completed ? '' : 'timeline-item-transparent'}`}>
              <span className={`timeline-point ${step.completed ? 'timeline-point-success' : 'timeline-point-secondary'}`}>
                {step.completed && <i className="ti ti-check"></i>}
              </span>
              <div className="timeline-event">
                <div className="timeline-header">
                  <h6 className="mb-0">{step.name}</h6>
                  {step.date && (
                    <small className="text-muted">{new Date(step.date).toLocaleString()}</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

