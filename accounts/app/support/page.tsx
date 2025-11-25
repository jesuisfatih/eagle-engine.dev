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
            alert(`✅ Support request submitted!\nSubject: ${formData.get('subject')}`);
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

