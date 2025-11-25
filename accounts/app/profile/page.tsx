'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: 'Muhammed',
    lastName: 'Adıgüzel',
    email: 'mhmmdadgzl@outlook.com',
    phone: '+905397278524',
    role: 'admin',
  });

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
              <button className="btn btn-primary mt-3">Save Changes</button>
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
              <button className="btn btn-primary">Update Password</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mx-auto mb-3">
                <span className="avatar-initial rounded-circle bg-label-primary">
                  {profile.firstName[0]}{profile.lastName[0]}
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

