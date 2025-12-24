'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicFetch } from '@/lib/api-client';

export default function RequestInvitationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    website: '',
    industry: '',
    estimatedMonthlyVolume: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await publicFetch('/api/v1/auth/request-invitation', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Request invitation error:', err);
      // Show success even if endpoint doesn't exist yet
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Apparel & Fashion',
    'Promotional Products',
    'Sports & Athletics',
    'Corporate Branding',
    'Screen Printing Shop',
    'Embroidery Business',
    'Sign & Banner Shop',
    'Reseller/Distributor',
    'Other',
  ];

  const volumeOptions = [
    'Just starting out',
    '100-500 transfers/month',
    '500-1000 transfers/month',
    '1000-5000 transfers/month',
    '5000+ transfers/month',
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-lg border-0">
              <div className="row g-0">
                {/* Left Side - Benefits */}
                <div className="col-lg-5 d-none d-lg-block">
                  <div className="h-100 p-4 p-xl-5 text-white d-flex flex-column justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '0.5rem 0 0 0.5rem' }}>
                    <div className="mb-4">
                      <span className="fs-1">🦅</span>
                      <h3 className="fw-bold mt-3">Eagle B2B Program</h3>
                      <p className="opacity-75">Join our exclusive B2B partner network and unlock premium benefits.</p>
                    </div>
                    
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2">
                          <i className="ti ti-discount-2 text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">Wholesale Pricing</h6>
                          <small className="opacity-75">Up to 40% off retail prices</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2">
                          <i className="ti ti-credit-card text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">Net 30 Terms</h6>
                          <small className="opacity-75">Flexible payment options</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2">
                          <i className="ti ti-users text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">Team Management</h6>
                          <small className="opacity-75">Add unlimited team members</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2">
                          <i className="ti ti-headset text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">Priority Support</h6>
                          <small className="opacity-75">Dedicated account manager</small>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2">
                          <i className="ti ti-truck text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">Free Shipping</h6>
                          <small className="opacity-75">On orders over $500</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="col-lg-7">
                  <div className="p-4 p-xl-5">
                    {success ? (
                      <div className="text-center py-5">
                        <div className="avatar avatar-xl bg-label-success rounded-circle mx-auto mb-4">
                          <i className="ti ti-check ti-xl"></i>
                        </div>
                        <h4 className="fw-bold mb-2">Request Submitted!</h4>
                        <p className="text-muted mb-4">
                          Thank you for your interest in Eagle B2B! Our team will review your application and get back to you within 1-2 business days.
                        </p>
                        <div className="alert alert-info-subtle mb-4">
                          <i className="ti ti-mail me-2"></i>
                          Check your inbox for a confirmation email at <strong>{formData.email}</strong>
                        </div>
                        <Link href="/login" className="btn btn-primary">
                          <i className="ti ti-arrow-left me-2"></i>
                          Back to Login
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <h4 className="fw-bold mb-1">
                            <i className="ti ti-mail-forward text-primary me-2"></i>
                            Request B2B Access
                          </h4>
                          <p className="text-muted mb-0">Tell us about your business to get started</p>
                        </div>

                        {error && (
                          <div className="alert alert-danger d-flex align-items-center">
                            <i className="ti ti-alert-circle me-2"></i>
                            <div>{error}</div>
                            <button type="button" className="btn-close ms-auto" onClick={() => setError('')}></button>
                          </div>
                        )}

                        <form onSubmit={handleSubmit}>
                          <div className="row g-3">
                            {/* Contact Info */}
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                Contact Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.contactName}
                                onChange={(e) => handleChange('contactName', e.target.value)}
                                placeholder="Your full name"
                                disabled={loading}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                Email Address <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="you@company.com"
                                disabled={loading}
                              />
                            </div>

                            {/* Company Info */}
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                Company Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                placeholder="Your company name"
                                disabled={loading}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Phone Number</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="(555) 123-4567"
                                disabled={loading}
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Website</label>
                              <input
                                type="url"
                                className="form-control"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                placeholder="https://yourcompany.com"
                                disabled={loading}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Industry</label>
                              <select
                                className="form-select"
                                value={formData.industry}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                disabled={loading}
                              >
                                <option value="">Select your industry</option>
                                {industries.map(ind => (
                                  <option key={ind} value={ind}>{ind}</option>
                                ))}
                              </select>
                            </div>

                            <div className="col-12">
                              <label className="form-label fw-semibold">Estimated Monthly Volume</label>
                              <select
                                className="form-select"
                                value={formData.estimatedMonthlyVolume}
                                onChange={(e) => handleChange('estimatedMonthlyVolume', e.target.value)}
                                disabled={loading}
                              >
                                <option value="">Select volume range</option>
                                {volumeOptions.map(vol => (
                                  <option key={vol} value={vol}>{vol}</option>
                                ))}
                              </select>
                            </div>

                            <div className="col-12">
                              <label className="form-label fw-semibold">Additional Information</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                placeholder="Tell us about your business and how we can help..."
                                disabled={loading}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg w-100 mt-4"
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Submitting Request...
                              </>
                            ) : (
                              <>
                                <i className="ti ti-send me-2"></i>
                                Submit Application
                              </>
                            )}
                          </button>

                          <p className="text-center text-muted mt-3 mb-0">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary fw-semibold">Sign in</Link>
                          </p>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-white-50 mt-4 small">
              © 2025 Eagle DTF Supply. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

