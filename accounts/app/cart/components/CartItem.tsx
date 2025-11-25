'use client';

interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="row mb-3 pb-3 border-bottom">
      <div className="col-md-7">
        <h6 className="fw-semibold mb-1">{item.title}</h6>
        <p className="text-muted small mb-2">{item.variantTitle}</p>
        <div>
          <span className="text-primary fw-bold">${item.unitPrice}</span>
          {item.listPrice > item.unitPrice && (
            <>
              <span className="text-muted small text-decoration-line-through ms-2">${item.listPrice}</span>
              <span className="badge bg-label-success ms-2">
                Save ${(item.listPrice - item.unitPrice).toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="col-md-3">
        <div className="input-group input-group-sm">
          <button
            className="btn btn-outline-secondary"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <input
            type="text"
            className="form-control text-center"
            value={item.quantity}
            readOnly
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <div className="col-md-2 text-end">
        <p className="fw-bold mb-2">${(item.unitPrice * item.quantity).toFixed(2)}</p>
        <button
          onClick={() => onRemove(item.id)}
          className="btn btn-sm btn-text-danger"
        >
          <i className="ti ti-trash"></i>
        </button>
      </div>
    </div>
  );
}

