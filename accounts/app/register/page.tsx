'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AccountType = 'b2b' | 'normal';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account Type & Email
    accountType: 'b2b' as AccountType,
    email: '',
    verificationCode: '',
    codeSent: false,
    emailVerified: false,
    skipEmailVerification: false,
    
    // Step 2: Personal Info
    firstName: '',
    lastName: '',
    phone: '',
    
    // Step 3: Company Info (B2B only)
    companyName: '',
    taxId: '',
    
    // Step 4: Billing Address
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'US',
    
    // Step 5: Shipping Address
    shippingSameAsBilling: true,
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: 'US',
    
    // Step 6: Password
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, codeSent: true }));
        
        // In development, show code
        if (data.code) {
          alert(`Verification code (dev): ${data.code}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCodeInput || verificationCodeInput.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          code: verificationCodeInput 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setFormData(prev => ({ ...prev, verificationCode: verificationCodeInput, emailVerified: true }));
        } else {
          setError('Invalid verification code');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Verification failed');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    
    // Validation based on step
    if (currentStep === 1) {
      if (!formData.email) {
        setError('Email is required');
        return;
      }
      // Email verification is optional - can skip
      if (!formData.skipEmailVerification && !formData.emailVerified) {
        if (!formData.codeSent) {
          setError('Please send verification code or skip email verification');
          return;
        }
        if (!formData.verificationCode) {
          setError('Please verify your email code or skip email verification');
          return;
        }
      }
    } else if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError('All personal information fields are required');
        return;
      }
    } else if (currentStep === 3 && formData.accountType === 'b2b') {
      if (!formData.companyName) {
        setError('Company name is required for B2B accounts');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.billingAddress1 || !formData.billingCity || !formData.billingPostalCode) {
        setError('Billing address fields are required');
        return;
      }
    } else if (currentStep === 5 && !formData.shippingSameAsBilling) {
      if (!formData.shippingAddress1 || !formData.shippingCity || !formData.shippingPostalCode) {
        setError('Shipping address fields are required');
        return;
      }
    } else if (currentStep === 6) {
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      handleSubmit();
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          accountType: formData.accountType,
          companyName: formData.accountType === 'b2b' ? formData.companyName : undefined,
          taxId: formData.accountType === 'b2b' ? formData.taxId : undefined,
          verificationCode: formData.emailVerified ? formData.verificationCode : undefined,
          skipEmailVerification: formData.skipEmailVerification,
          billingAddress: {
            address1: formData.billingAddress1,
            address2: formData.billingAddress2,
            city: formData.billingCity,
            state: formData.billingState,
            postalCode: formData.billingPostalCode,
            country: formData.billingCountry,
          },
          shippingAddress: formData.shippingSameAsBilling ? undefined : {
            address1: formData.shippingAddress1,
            address2: formData.shippingAddress2,
            city: formData.shippingCity,
            state: formData.shippingState,
            postalCode: formData.shippingPostalCode,
            country: formData.shippingCountry,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show success message
        const modal = document.createElement('div');
        modal.className = 'modal fade show d-block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-info text-white">
                <h5 class="modal-title">✅ Registration Successful!</h5>
                <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove(); window.location.href='/login';"></button>
              </div>
              <div class="modal-body">
                <p><strong>Your account has been created successfully!</strong></p>
                <p>Your account is pending admin approval. You will receive an email notification once your account is approved.</p>
                <p className="mb-0">All your information has been synced to Shopify.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove(); window.location.href='/login';">Go to Login</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = formData.accountType === 'b2b' ? 6 : 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card-body p-4 p-sm-5">
            <div className="app-brand justify-content-center mb-4">
              <span className="app-brand-text demo text-body fw-bold ms-2">
                <span className="text-primary text-4xl">🦅</span>
                <span className="ms-2">Eagle B2B</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Step {currentStep} of {totalSteps}</span>
                <span className="small text-muted">{Math.round(progress)}%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                <div className="alert-message">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              </div>
            )}

            {/* Step 1: Account Type & Email Verification */}
            {currentStep === 1 && (
              <div>
                <h4 className="mb-1 fw-bold">Account Type & Email</h4>
                <p className="mb-4">Choose your account type and verify your email</p>

                <div className="mb-3">
                  <label className="form-label">Account Type *</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <div 
                        className={`card border ${formData.accountType === 'b2b' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, accountType: 'b2b' }))}
                      >
                        <div className="card-body text-center p-3">
                          <i className="ti ti-building-store ti-2x mb-2 text-primary"></i>
                          <div className="fw-bold">B2B Account</div>
                          <small className="text-muted">For businesses</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div 
                        className={`card border ${formData.accountType === 'normal' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, accountType: 'normal' }))}
                      >
                        <div className="card-body text-center p-3">
                          <i className="ti ti-user ti-2x mb-2 text-primary"></i>
                          <div className="fw-bold">Normal Account</div>
                          <small className="text-muted">For individuals</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address *</label>
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value, codeSent: false }))}
                      placeholder="your@email.com"
                      disabled={loading || formData.codeSent}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleSendVerificationCode}
                      disabled={loading || !formData.email || formData.codeSent}
                    >
                      {formData.codeSent ? 'Sent ✓' : 'Send Code'}
                    </button>
                  </div>
                </div>

                {formData.codeSent && (
                  <div className="mb-3">
                    <label className="form-label">Verification Code</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control text-center"
                        maxLength={6}
                        value={verificationCodeInput}
                        onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        disabled={loading || formData.emailVerified}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleVerifyCode}
                        disabled={loading || verificationCodeInput.length !== 6 || formData.emailVerified}
                      >
                        {formData.emailVerified ? 'Verified ✓' : 'Verify'}
                      </button>
                    </div>
                    <small className="text-muted">Enter the 6-digit code sent to your email</small>
                  </div>
                )}

                <div className="d-flex gap-2">
                  {!formData.emailVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, skipEmailVerification: true, emailVerified: false }));
                        setCurrentStep(2);
                      }}
                      className="btn btn-label-secondary flex-grow-1"
                      disabled={loading || !formData.email}
                    >
                      Skip for now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading || (!formData.emailVerified && !formData.skipEmailVerification && formData.codeSent)}
                    className="btn btn-primary flex-grow-1"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div>
                <h4 className="mb-1 fw-bold">Personal Information</h4>
                <p className="mb-4">Tell us about yourself</p>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-label-secondary"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary flex-grow-1"
                    disabled={loading}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Company Information (B2B only) */}
            {currentStep === 3 && formData.accountType === 'b2b' && (
              <div>
                <h4 className="mb-1 fw-bold">Company Information</h4>
                <p className="mb-4">Tell us about your company</p>

                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Acme Corporation"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Tax ID / VAT Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="TAX123456"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-label-secondary"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary flex-grow-1"
                    disabled={loading}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Billing Address */}
            {currentStep === 4 && (
              <div>
                <h4 className="mb-1 fw-bold">Billing Address</h4>
                <p className="mb-4">Where should we send invoices?</p>

                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label">Address Line 1 *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.billingAddress1}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingAddress1: e.target.value }))}
                      placeholder="123 Main Street"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.billingAddress2}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingAddress2: e.target.value }))}
                      placeholder="Suite 100"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.billingCity}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingCity: e.target.value }))}
                      placeholder="New York"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">State / Province</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.billingState}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingState: e.target.value }))}
                      placeholder="NY"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.billingPostalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingPostalCode: e.target.value }))}
                      placeholder="10001"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.billingCountry}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingCountry: e.target.value }))}
                      disabled={loading}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="TR">Turkey</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-label-secondary"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary flex-grow-1"
                    disabled={loading}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Shipping Address */}
            {currentStep === 5 && (
              <div>
                <h4 className="mb-1 fw-bold">Shipping Address</h4>
                <p className="mb-4">Where should we ship your orders?</p>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sameAsBilling"
                      checked={formData.shippingSameAsBilling}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, shippingSameAsBilling: e.target.checked }));
                        if (e.target.checked) {
                          // Copy billing to shipping
                          setFormData(prev => ({
                            ...prev,
                            shippingAddress1: prev.billingAddress1,
                            shippingAddress2: prev.billingAddress2,
                            shippingCity: prev.billingCity,
                            shippingState: prev.billingState,
                            shippingPostalCode: prev.billingPostalCode,
                            shippingCountry: prev.billingCountry,
                          }));
                        }
                      }}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="sameAsBilling">
                      Same as billing address
                    </label>
                  </div>
                </div>

                {!formData.shippingSameAsBilling && (
                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label">Address Line 1 *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.shippingAddress1}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress1: e.target.value }))}
                        placeholder="123 Main Street"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address Line 2</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.shippingAddress2}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress2: e.target.value }))}
                        placeholder="Suite 100"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.shippingCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingCity: e.target.value }))}
                        placeholder="New York"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">State / Province</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.shippingState}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingState: e.target.value }))}
                        placeholder="NY"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Postal Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.shippingPostalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingPostalCode: e.target.value }))}
                        placeholder="10001"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.shippingCountry}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingCountry: e.target.value }))}
                        disabled={loading}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="TR">Turkey</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-label-secondary"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary flex-grow-1"
                    disabled={loading}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Password */}
            {currentStep === 6 && (
              <div>
                <h4 className="mb-1 fw-bold">Account Security</h4>
                <p className="mb-4">Create a secure password</p>

                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <small className="text-muted">Minimum 8 characters</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-label-secondary"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-success flex-grow-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-check me-2"></i>
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center mt-4 mb-0">
              <span>Already have an account? </span>
              <a href="/login">
                <span>Sign in</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

