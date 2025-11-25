'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/carts/active`);
      const cart = await response.json();
      setCartCount(cart?.items?.length || 0);
    } catch (err) {
      setCartCount(0);
    }
  };

  return (
    <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme">
      <div className="container-xxl">
        <div className="navbar-nav-right d-flex align-items-center">
          <ul className="navbar-nav flex-row align-items-center ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/cart">
                <i className="ti ti-shopping-cart ti-md"></i>
                {cartCount > 0 && (
                  <span className="badge bg-danger rounded-pill badge-notifications">{cartCount}</span>
                )}
              </a>
            </li>
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                href="javascript:void(0);"
                data-bs-toggle="dropdown"
              >
                <div className="avatar avatar-online">
                  <span className="avatar-initial rounded-circle bg-label-primary">MA</span>
                </div>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="/profile">
                    <i className="ti ti-user me-2"></i>
                    <span className="align-middle">Profile</span>
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="/team">
                    <i className="ti ti-users me-2"></i>
                    <span className="align-middle">Team</span>
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="/login">
                    <i className="ti ti-logout me-2"></i>
                    <span className="align-middle">Logout</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

