'use client';

import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  return (
    <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
      <div className="container-xxl">
        <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
          {/* Search */}
          <div className="navbar-nav align-items-center">
            <div className="nav-item navbar-search-wrapper mb-0">
              <span className="d-inline-block p-1 me-2">
                <i className="icon-base ti tabler-search ti-sm"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search companies, orders..."
                aria-label="Search..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    window.location.href = `/companies?search=${query}`;
                  }
                }}
              />
            </div>
          </div>

          <ul className="navbar-nav flex-row align-items-center ms-auto">
            {/* Notifications */}
            <li className="nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-1">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                href="javascript:void(0);"
                data-bs-toggle="dropdown"
              >
                <i className="icon-base ti tabler-bell ti-md"></i>
                <span className="badge bg-danger rounded-pill badge-notifications">0</span>
              </a>
              <NotificationDropdown />
            </li>

            {/* User */}
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                href="javascript:void(0);"
                data-bs-toggle="dropdown"
              >
                <div className="avatar avatar-online">
                  <span className="avatar-initial rounded-circle bg-label-primary">AD</span>
                </div>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="/settings">
                    <i className="ti ti-settings me-2 ti-sm"></i>
                    <span className="align-middle">Settings</span>
                  </a>
                </li>
                <li>
                  <div className="dropdown-divider"></div>
                </li>
                <li>
                  <a className="dropdown-item" href="/login">
                    <i className="ti ti-logout me-2 ti-sm"></i>
                    <span className="align-middle">Log Out</span>
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




