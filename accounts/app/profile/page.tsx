'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string;
  orderCount?: number;
  totalSpent?: number;
  companyName?: string;
}

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  quoteAlerts: boolean;
  teamActivity: boolean;
  weeklyDigest: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    quoteAlerts: true,
    teamActivity: true,
    weeklyDigest: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await accountsFetch('/api/v1/company-users/me');
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'member',
          createdAt: data.createdAt,
          lastLoginAt: data.lastLoginAt,
          orderCount: data.orderCount || 0,
          totalSpent: data.totalSpent || 0,
          companyName: data.company?.name || localStorage.getItem('eagle_companyName') || '',
        });
      }
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await accountsFetch('/api/v1/company-users/me', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });
      
      if (response.ok) {
        setMessage({type: 'success', text: 'Profile updated successfully!'});
        localStorage.setItem('eagle_userName', `${profile.firstName} ${profile.lastName}`);
      } else {
        setMessage({type: 'error', text: 'Failed to update profile'});
      }
    } catch (err) {
      setMessage({type: 'error', text: 'Failed to update profile'});
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({type: 'error', text: 'New passwords do not match'});
      return;
    }
    if (passwords.new.length < 8) {
      setMessage({type: 'error', text: 'Password must be at least 8 characters'});
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const response = await accountsFetch('/api/v1/company-users/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (response.ok) {
        setMessage({type: 'success', text: 'Password changed successfully!'});
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const error = await response.json().catch(() => ({}));
        setMessage({type: 'error', text: error.message || 'Failed to change password'});
      }
    } catch (err) {
      setMessage({type: 'error', text: 'Failed to change password'});
    } finally {
      setChangingPassword(false);
    }
  };

  const saveNotificationPrefs = async () => {
    setSavingNotifs(true);
    try {
      const response = await accountsFetch('/api/v1/company-users/me/notifications', {
        method: 'PUT',
        body: JSON.stringify(notifPrefs),
      });

      if (response.ok) {
        setMessage({type: 'success', text: 'Notification preferences saved!'});
      } else {
        setMessage({type: 'error', text: 'Failed to save preferences'});
      }
    } catch (err) {
      setMessage({type: 'error', text: 'Failed to save preferences'});
    } finally {
      setSavingNotifs(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { label: string; class: string; icon: string }> = {
      ADMIN: { label: 'Administrator', class: 'bg-danger', icon: 'shield' },
      MANAGER: { label: 'Manager', class: 'bg-warning', icon: 'user-star' },
      BUYER: { label: 'Buyer', class: 'bg-primary', icon: 'shopping-cart' },
      VIEWER: { label: 'Viewer', class: 'bg-secondary', icon: 'eye' },
    };
    const config = configs[role] || { label: role, class: 'bg-secondary', icon: 'user' };
    return (
      <span className={`badge ${config.class}`}>
        <i className={`ti ti-${config.icon} me-1`}></i>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2 text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Account Settings</h4>
          <p className="mb-0 text-muted">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="row">
        {/* Sidebar - Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                style={{ width: 100, height: 100, fontSize: 36 }}
              >
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
              <h5 className="mb-1">{profile.firstName} {profile.lastName}</h5>
              <p className="text-muted mb-2">{profile.email}</p>
              {getRoleBadge(profile.role)}
              
              {profile.companyName && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted d-block mb-1">Company</small>
                  <span className="fw-semibold">{profile.companyName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="mb-3">Account Statistics</h6>
              <div className="row g-3">
                <div className="col-6">
                  <div className="bg-light rounded p-3 text-center">
                    <h4 className="mb-0 text-primary">{profile.orderCount || 0}</h4>
                    <small className="text-muted">Orders</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded p-3 text-center">
                    <h4 className="mb-0 text-success">{formatCurrency(profile.totalSpent || 0)}</h4>
                    <small className="text-muted">Total Spent</small>
                  </div>
                </div>
              </div>
              <ul className="list-unstyled small mt-3 mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Member Since</span>
                  <span>{profile.createdAt ? formatRelativeTime(profile.createdAt) : 'N/A'}</span>
                </li>
                <li className="d-flex justify-content-between py-2">
                  <span className="text-muted">Last Login</span>
                  <span>{profile.lastLoginAt ? formatRelativeTime(profile.lastLoginAt) : 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8">
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setMessage(null); }}
              >
                <i className="ti ti-user me-1"></i>Profile
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => { setActiveTab('security'); setMessage(null); }}
              >
                <i className="ti ti-lock me-1"></i>Security
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => { setActiveTab('notifications'); setMessage(null); }}
              >
                <i className="ti ti-bell me-1"></i>Notifications
              </button>
            </li>
          </ul>

          {/* Alert Message */}
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
              <i className={`ti ti-${message.type === 'success' ? 'check' : 'alert-circle'} me-2`}></i>
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Personal Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={saveProfile} disabled={saving} className="btn btn-primary">
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-check me-1"></i>Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Change Password</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={changePassword} 
                    disabled={changingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                    className="btn btn-primary"
                  >
                    {changingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-lock me-1"></i>Update Password
                      </>
                    )}
                  </button>
                </div>
                
                {/* Security Tips */}
                <div className="alert alert-light mt-4 mb-0">
                  <h6 className="alert-heading mb-2">
                    <i className="ti ti-shield-check me-1"></i>Password Tips
                  </h6>
                  <ul className="mb-0 small">
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Don't reuse passwords from other sites</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Email Notifications</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="orderUpdates"
                      checked={notifPrefs.orderUpdates}
                      onChange={(e) => setNotifPrefs({...notifPrefs, orderUpdates: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="orderUpdates">
                      <strong>Order Updates</strong>
                      <p className="text-muted small mb-0">Receive notifications about order status changes and shipping updates</p>
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="quoteAlerts"
                      checked={notifPrefs.quoteAlerts}
                      onChange={(e) => setNotifPrefs({...notifPrefs, quoteAlerts: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="quoteAlerts">
                      <strong>Quote Alerts</strong>
                      <p className="text-muted small mb-0">Get notified when quotes are ready or about to expire</p>
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="teamActivity"
                      checked={notifPrefs.teamActivity}
                      onChange={(e) => setNotifPrefs({...notifPrefs, teamActivity: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="teamActivity">
                      <strong>Team Activity</strong>
                      <p className="text-muted small mb-0">Notifications about team member actions and approvals</p>
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="promotions"
                      checked={notifPrefs.promotions}
                      onChange={(e) => setNotifPrefs({...notifPrefs, promotions: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="promotions">
                      <strong>Promotions & Deals</strong>
                      <p className="text-muted small mb-0">Special offers, discounts, and exclusive B2B deals</p>
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="weeklyDigest"
                      checked={notifPrefs.weeklyDigest}
                      onChange={(e) => setNotifPrefs({...notifPrefs, weeklyDigest: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="weeklyDigest">
                      <strong>Weekly Digest</strong>
                      <p className="text-muted small mb-0">Weekly summary of your account activity and spending</p>
                    </label>
                  </div>
                </div>
                <button onClick={saveNotificationPrefs} disabled={savingNotifs} className="btn btn-primary">
                  {savingNotifs ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-check me-1"></i>Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}