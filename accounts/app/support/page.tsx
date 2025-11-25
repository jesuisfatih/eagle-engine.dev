'use client';

export default function SupportPage() {
  return (
    <div>
      <h4 className="fw-bold mb-4">Help & Support</h4>

      <div className="card">
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

