'use client';

export default function AddressesPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Saved Addresses</h4>
        <button
          onClick={() => {
            const modal = document.createElement('div');
            modal.className = 'modal fade show d-block';
            modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modal.innerHTML = `
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Add Address</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label class="form-label">Address Line 1</label>
                      <input type="text" class="form-control" placeholder="123 Main St">
                    </div>
                    <div class="mb-3">
                      <label class="form-label">City</label>
                      <input type="text" class="form-control">
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="alert('Address saved'); this.closest('.modal').remove();">Save</button>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(modal);
          }}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          Add Address
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <h6 className="mb-0">Billing Address</h6>
                <span className="badge bg-label-primary">Default</span>
              </div>
              <p className="mb-1">Muhammed Adıgüzel</p>
              <p className="mb-1 small text-muted">United States</p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    const modal = document.createElement('div');
                    modal.className = 'modal fade show d-block';
                    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    modal.innerHTML = `
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">Edit Address</h5>
                            <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                          </div>
                          <div class="modal-body">
                            <input type="text" class="form-control" value="United States">
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="alert('Updated'); this.closest('.modal').remove();">Update</button>
                          </div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(modal);
                  }}
                  className="btn btn-sm btn-label-secondary me-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const modal = document.createElement('div');
                    modal.className = 'modal fade show d-block';
                    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    modal.innerHTML = `
                      <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">Delete Address</h5>
                            <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                          </div>
                          <div class="modal-body">Are you sure you want to delete this address?</div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="button" class="btn btn-danger" onclick="alert('Deleted'); this.closest('.modal').remove();">Delete</button>
                          </div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(modal);
                  }}
                  className="btn btn-sm btn-text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteModal.show && (
        <Modal
          show={deleteModal.show}
          onClose={() => setDeleteModal({show: false, id: ''})}
          onConfirm={() => handleDelete(deleteModal.id)}
          title="Delete Address"
          message="Are you sure you want to delete this address?"
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: ''})}
          onConfirm={() => setResultModal({show: false, message: ''})}
          title={resultModal.message.includes('✅') ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.message.includes('✅') ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

