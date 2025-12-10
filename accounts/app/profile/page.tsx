'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
        // Update localStorage
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Profile Settings</h4>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Personal Information</h6>
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
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.email}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
              </div>
              
              {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mt-3`}>
                  {message.text}
                </div>
              )}
              
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn btn-primary mt-3"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h6 className="mb-3">Change Password</h6>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" />
              </div>
              <button className="btn btn-primary">
                Update Password
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mx-auto mb-3">
                <span className="avatar-initial rounded-circle bg-label-primary" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
                  {profile.firstName?.[0] || ''}{profile.lastName?.[0] || ''}
                </span>
              </div>
              <h5 className="mb-1">{profile.firstName} {profile.lastName}</h5>
              <p className="text-muted mb-3">{profile.email}</p>
              <span className="badge bg-label-success">{profile.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}