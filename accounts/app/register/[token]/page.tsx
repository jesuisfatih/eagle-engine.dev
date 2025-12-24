'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicFetch } from '@/lib/api-client';

interface InvitationData {
  email: string;
  companyName?: string;
  role?: string;
  invitedBy?: string;
}

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  useEffect(() => {
    // Load invitation data
    loadInvitationData();
  }, [params.token]);

  const loadInvitationData = async () => {
    try {
      // Validate token by trying to get user info
      const response = await publicFetch(`/api/v1/auth/validate-invitation?token=${params.token}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvitationData(data);
        // Pre-fill email if available
        if (data.email) {
          setFormData(prev => ({ ...prev, email: data.email }));
        }
        // Pre-fill company name if available
        if (data.companyName) {
          setFormData(prev => ({ ...prev, companyName: data.companyName }));
        }
      } else {
        setError('Invalid or expired invitation token');
      }
    } catch (err) {
      console.warn('Could not load invitation data:', err);
      setError('Could not validate invitation. Please check the link.');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long!');
      return;
    }

    // Password complexity: uppercase, lowercase, number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number!');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required!');
      return;
    }

    if (!formData.companyName) {
      setError('Company name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await publicFetch('/api/v1/auth/accept-invitation', {
        method: 'POST',
        body: JSON.stringify({
          token: params.token,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          companyInfo: {
            name: formData.companyName,
            taxId: formData.taxId,
            phone: formData.phone,
            billingAddress: {
              address1: formData.address1,
              address2: formData.address2,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('eagle_token', data.accessToken);
        localStorage.setItem('eagle_userId', data.user.id);
        localStorage.setItem('eagle_companyId', data.user.companyId);
        localStorage.setItem('eagle_userEmail', data.user.email);
        localStorage.setItem('eagle_userName', `${data.user.firstName} ${data.user.lastName}`);
        
        // Show success message
        const modal = document.createElement('div');
        modal.className = 'modal fade show d-block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-success text-white">
                <h5 class="modal-title">✅ Registration Successful!</h5>
                <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove(); window.location.href='/dashboard';"></button>
              </div>
              <div class="modal-body">
                <p>Your account has been created successfully and synced to Shopify!</p>
                <p class="mb-0">Redirecting to dashboard...</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-success" onclick="this.closest('.modal').remove(); window.location.href='/dashboard';">Go to Dashboard</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Registration error:', err);
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
              <h2 className="mb-3">🦅 Welcome to Eagle B2B</h2>
              <p className="lead">Complete your registration to start ordering</p>
            </div>
          </div>
        </div>

        <div className="d-flex col-12 col-lg-5 align-items-center p-sm-5 p-4">
          <div className="w-px-400 mx-auto">
            <div className="app-brand mb-4">
              <span className="text-primary text-4xl">🦅</span>
              <span className="app-brand-text demo fw-bold ms-2">Eagle B2B</span>
            </div>
            <h4 className="mb-1 fw-bold">Complete Registration 👋</h4>
            <p className="mb-4">Fill in your details to activate your account</p>

            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                <div className="alert-message">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <h6 className="mb-3 text-primary">Personal Information</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@company.com"
                    disabled={true}
                    readOnly
                  />
                  <small className="text-muted">Email from invitation (cannot be changed)</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                    disabled={loading}
                  />
                </div>
              </div>

              <h6 className="mb-3 text-primary mt-4">Company Information</h6>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="Acme Corporation"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    placeholder="TAX123456"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Country *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
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

              <h6 className="mb-3 text-primary mt-4">Billing Address</h6>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label">Address Line 1 *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.address1}
                    onChange={(e) => setFormData({...formData, address1: e.target.value})}
                    placeholder="123 Main Street"
                    disabled={loading}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address2}
                    onChange={(e) => setFormData({...formData, address2: e.target.value})}
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
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="New York"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">State / Province</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
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
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    placeholder="10001"
                    disabled={loading}
                  />
                </div>
              </div>

              <h6 className="mb-3 text-primary mt-4">Account Security</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <small className="text-muted">Minimum 8 characters</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary d-grid w-100 mb-3"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

