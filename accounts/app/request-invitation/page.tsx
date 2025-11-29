'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestInvitationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      // TODO: Add endpoint for requesting invitation
      // For now, show message that admin needs to invite
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to request invitation. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authentication-wrapper authentication-cover authentication-bg">
      <div className="authentication-inner row">
        <div className="d-none d-lg-flex col-lg-7 p-0">
          <div className="auth-cover-bg auth-cover-bg-color d-flex justify-content-center align-items-center">
            <div className="text-center text-white p-5">
              <h2 className="mb-3">🦅 Join Eagle B2B</h2>
              <p className="lead">Request access to our B2B platform</p>
            </div>
          </div>
        </div>

        <div className="d-flex col-12 col-lg-5 align-items-center p-sm-5 p-4">
          <div className="w-px-400 mx-auto">
            <div className="app-brand mb-4">
              <span className="text-primary text-4xl">🦅</span>
              <span className="app-brand-text demo fw-bold ms-2">Eagle B2B</span>
            </div>
            <h4 className="mb-1 fw-bold">Request Invitation 👋</h4>
            <p className="mb-4">Fill in your details to request access</p>

            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                <div className="alert-message">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              </div>
            )}

            {success ? (
              <div className="alert alert-success">
                <i className="ti ti-check-circle me-2"></i>
                <strong>Request Submitted!</strong>
                <p className="mb-0 mt-2">
                  Your invitation request has been submitted. An admin will review your request and send you an invitation email.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-primary mt-3"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@company.com"
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Name"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary d-grid w-100 mb-3"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Request Invitation'
                  )}
                </button>
                <p className="text-center">
                  <span>Already have an account? </span>
                  <a href="/login">
                    <span>Sign in</span>
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

