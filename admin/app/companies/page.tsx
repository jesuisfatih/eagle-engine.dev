'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [shopifyCustomers, setShopifyCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'shopify'>('companies');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const [companiesData, customersData] = await Promise.all([
        apiClient.getCompanies().catch(() => []),
        fetch(`${API_URL}/api/v1/shopify-customers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('eagle_admin_token')}` }
        }).then(r => r.json()).catch(() => []),
      ]);
      setCompanies(companiesData);
      setShopifyCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [convertModal, setConvertModal] = useState<{show: boolean; customerId: string | null}>({
    show: false,
    customerId: null,
  });
  const [resultModal, setResultModal] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({
    show: false,
    type: 'success',
    message: '',
  });

  const convertToCompany = async () => {
    if (!convertModal.customerId) return;
    
    // Check if already converted
    const customer = shopifyCustomers.find(c => c.id === convertModal.customerId);
    const alreadyConverted = companies.find(comp => 
      comp.createdByShopifyCustomerId?.toString() === customer?.shopifyCustomerId
    );
    
    if (alreadyConverted) {
      setConvertModal({ show: false, customerId: null });
      setResultModal({
        show: true,
        type: 'error',
        message: 'Bu customer zaten B2B firmaya dönüştürülmüş!',
      });
      return;
    }
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/shopify-customers/${convertModal.customerId}/convert-to-company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eagle_admin_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setConvertModal({ show: false, customerId: null });
        setResultModal({
          show: true,
          type: 'success',
          message: 'Firma başarıyla oluşturuldu! Davet emaili gönderildi.',
        });
        setTimeout(() => loadData(), 1000);
      } else {
        const error = await response.json();
        setConvertModal({ show: false, customerId: null });
        setResultModal({
          show: true,
          type: 'error',
          message: error.message || 'İşlem başarısız oldu',
        });
      }
    } catch (err: any) {
      setConvertModal({ show: false, customerId: null });
      setResultModal({
        show: true,
        type: 'error',
        message: err.message,
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies & Shopify Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            B2B firmalarını yönetin veya Shopify müşterilerini firmaya dönüştürün
          </p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            B2B Companies ({companies.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'shopify' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopify')}
          >
            Shopify Customers ({shopifyCustomers.length})
          </button>
        </li>
      </ul>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="card">
          <div className="card-body">
          {companies.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-building ti-3x text-muted mb-3"></i>
              <h5>No B2B companies yet</h5>
              <p className="text-muted">Convert Shopify customers to B2B companies from the Shopify tab.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Users</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company: any) => (
                    <tr key={company.id}>
                      <td>
                        <div className="fw-semibold">{company.name}</div>
                        <div className="text-muted small">{company.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          company.status === 'active' ? 'bg-label-success' : 'bg-label-warning'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td>{company._count?.users || 0}</td>
                      <td>{company._count?.orders || 0}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-icon"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ti ti-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <Link href={`/companies/${company.id}`} className="dropdown-item">
                                <i className="ti ti-eye me-2"></i>View Details
                              </Link>
                            </li>
                            {company.status === 'pending' && (
                              <li>
                                <a className="dropdown-item" href="javascript:void(0);">
                                  <i className="ti ti-check me-2"></i>Approve Company
                                </a>
                              </li>
                            )}
                            <li>
                              <a className="dropdown-item" href="javascript:void(0);">
                                <i className="ti ti-edit me-2"></i>Edit Info
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="javascript:void(0);">
                                <i className="ti ti-tag me-2"></i>Set Pricing
                              </a>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <a className="dropdown-item text-danger" href="javascript:void(0);">
                                <i className="ti ti-trash me-2"></i>Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Shopify Customers Tab */}
      {activeTab === 'shopify' && (
        <div className="card">
          <div className="card-body">
          {shopifyCustomers.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-users ti-3x text-muted mb-3"></i>
              <h5>No Shopify customers synced</h5>
              <p className="text-muted">Go to Settings and click "Run Full Sync" to import customers.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopifyCustomers.map((customer: any) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="fw-semibold">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-muted small">{customer.email}</div>
                      </td>
                      <td>{customer.ordersCount || 0}</td>
                      <td className="fw-semibold">${customer.totalSpent || 0}</td>
                      <td>
                        <button
                          onClick={() => setConvertModal({ show: true, customerId: customer.id })}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="ti ti-building me-1"></i>
                          Convert to B2B
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Convert Confirmation Modal */}
      <Modal
        show={convertModal.show}
        onClose={() => setConvertModal({ show: false, customerId: null })}
        onConfirm={convertToCompany}
        title="Firmaya Dönüştür"
        message="Bu Shopify müşterisini B2B firmaya dönüştürmek istiyor musunuz? Davet emaili gönderilecektir."
        confirmText="Evet, Dönüştür"
        cancelText="İptal"
        type="primary"
      />

      {/* Result Modal */}
      <Modal
        show={resultModal.show}
        onClose={() => setResultModal({ ...resultModal, show: false })}
        onConfirm={() => setResultModal({ ...resultModal, show: false })}
        title={resultModal.type === 'success' ? 'Başarılı' : 'Hata'}
        message={resultModal.message}
        confirmText="Tamam"
        type={resultModal.type === 'success' ? 'success' : 'danger'}
      />
    </div>
  );
}
