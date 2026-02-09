'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      if (query.trim()) {
        window.location.href = `/companies?search=${encodeURIComponent(query)}`;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eagle_admin_token');
    localStorage.removeItem('eagle_merchantId');
    window.location.href = '/login';
  };

  return (
    <header className="apple-header">
      <div className="header-search">
        <i className="ti ti-search header-search-icon" />
        <input
          type="text"
          placeholder="Search companies, orders..."
          onKeyDown={handleSearch}
        />
      </div>

      <div className="header-actions">
        <button className="header-action-btn">
          <i className="ti ti-bell" />
        </button>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className="header-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            AD
          </div>

          <div className={`apple-dropdown ${showDropdown ? 'open' : ''}`}>
            <Link href="/settings" className="dropdown-item-apple" onClick={() => setShowDropdown(false)}>
              <i className="ti ti-settings" style={{ fontSize: 16 }} />
              Settings
            </Link>
            <div className="dropdown-divider-apple" />
            <button className="dropdown-item-apple danger" onClick={handleLogout}>
              <i className="ti ti-logout" style={{ fontSize: 16 }} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
