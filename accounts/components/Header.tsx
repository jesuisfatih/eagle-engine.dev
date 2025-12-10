'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accountsFetch } from '@/lib/api-client';

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadCartCount();
    loadUserInfo();
  }, []);

  const loadCartCount = async () => {
    try {
      const token = localStorage.getItem('eagle_token');
      const companyId = localStorage.getItem('eagle_companyId');
      const userId = localStorage.getItem('eagle_userId');
      
      if (!token || !companyId || !userId) return;
      
      const response = await accountsFetch(`/api/v1/carts/active?companyId=${companyId}&userId=${userId}`);
      
      if (response.ok && response.status !== 204) {
        const cart = await response.json();
        setCartCount(cart?.items?.length || 0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };

  const loadUserInfo = () => {
    const name = localStorage.getItem('eagle_userName') || '';
    const email = localStorage.getItem('eagle_userEmail') || '';
    setUserName(name || email.split('@')[0] || 'U');
  };

  const handleLogout = async () => {
    try {
      // Clear all auth data
      localStorage.removeItem('eagle_token');
      localStorage.removeItem('eagle_userId');
      localStorage.removeItem('eagle_companyId');
      localStorage.removeItem('eagle_userEmail');
      localStorage.removeItem('eagle_userName');
      localStorage.removeItem('eagle_loginTime');
      sessionStorage.removeItem('eagle_token');
      sessionStorage.removeItem('eagle_checkout_autofill');
      
      // Clear IndexedDB
      try {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('eagle_auth_db', 2);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const transaction = db.transaction(['auth_store'], 'readwrite');
        const store = transaction.objectStore('auth_store');
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (dbErr) {
        console.warn('IndexedDB clear failed:', dbErr);
      }
      
      // Broadcast logout to all tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('eagle_auth');
        channel.postMessage({ type: 'logout', timestamp: Date.now() });
        channel.close();
      }
      
      // Redirect to login
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force redirect anyway
      router.push('/login');
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
                  <span className="avatar-initial rounded-circle bg-label-primary">
                    {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
                  </span>
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
                  <a 
                    className="dropdown-item" 
                    href="javascript:void(0);"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
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

