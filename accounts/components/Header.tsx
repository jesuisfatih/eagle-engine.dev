'use client';

export default function Header() {
  return (
    <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme">
      <div className="container-xxl">
        <div className="navbar-nav-right d-flex align-items-center">
          <ul className="navbar-nav flex-row align-items-center ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/cart">
                <i className="ti ti-shopping-cart ti-md"></i>
                <span className="badge bg-danger rounded-pill badge-notifications">3</span>
              </a>
            </li>
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a className="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);">
                <div className="avatar avatar-online">
                  <span className="avatar-initial rounded-circle bg-label-primary">TC</span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

