'use client';

export default function SupportPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Help & Support</h4>

      <div className="card">
        <div className="card-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            const modal = document.createElement('div');
            modal.className = 'modal fade show d-block';
            modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modal.innerHTML = `
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">✅ Success</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                  </div>
                  <div class="modal-body">Support request submitted!<br>Subject: ${formData.get('subject')}</div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(modal);
            e.currentTarget.reset();
          }}>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input type="text" name="subject" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea name="message" className="form-control" rows={4} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

