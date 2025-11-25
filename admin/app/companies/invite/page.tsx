'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteCompanyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      
      // Create company
      const companyResp = await fetch(`${API_URL}/api/v1/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          email: email,
          status: 'pending',
        }),
      });

      const company = await companyResp.json();

      // Invite user
      await fetch(`${API_URL}/api/v1/companies/${company.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          role: 'admin',
        }),
      });

      alert('✅ Invitation sent successfully!');
      router.push('/companies');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Invite New Company</h4>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleInvite}>
                <div className="mb-3">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contact Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                  />
                  <small className="text-muted">
                    An invitation email will be sent to this address
                  </small>
                </div>

                <div className="alert alert-info">
                  <i className="ti ti-info-circle me-2"></i>
                  The recipient will receive an email with a registration link to complete their company profile.
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/companies')}
                    className="btn btn-label-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

