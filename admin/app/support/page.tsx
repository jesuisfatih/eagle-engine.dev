'use client';

export default function SupportPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Support & Help</h4>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Contact Support</h6>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const subject = formData.get('subject');
                const message = formData.get('message');
                
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
                      <div class="modal-body">Support ticket created!<br>Subject: ${subject}</div>
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
                  <input
                    type="text"
                    name="subject"
                    className="form-control"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows={5}
                    placeholder="Describe your issue..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="ti ti-send me-1"></i>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Quick Links</h6>
              <div className="d-grid gap-2">
                <a href="#" className="btn btn-label-primary">
                  <i className="ti ti-book me-2"></i>Documentation
                </a>
                <a href="#" className="btn btn-label-success">
                  <i className="ti ti-video me-2"></i>Video Tutorials
                </a>
                <a href="#" className="btn btn-label-info">
                  <i className="ti ti-message-circle me-2"></i>Live Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

