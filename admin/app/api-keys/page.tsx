'use client';

import { useState, useEffect } from 'react';
import ApiKeyModal from '@/components/ApiKeyModal';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [resultModal, setResultModal] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({
    show: false, type: 'success', message: ''
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/v1/api-keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (keyName: string) => {
    try {
      const response = await adminFetch('/api/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setShowGenerateModal(false);
        setResultModal({
          show: true,
          type: 'success',
          message: `New API Key: ${newKey.key}\n\nSave this key securely!`
        });
        loadKeys();
      } else {
        setResultModal({show: true, type: 'error', message: 'Failed to generate key'});
      }
    } catch (err) {
      setResultModal({show: true, type: 'error', message: 'Failed to generate key'});
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await adminFetch(`/api/v1/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResultModal({show: true, type: 'success', message: 'API Key deleted'});
        loadKeys();
      } else {
        setResultModal({show: true, type: 'error', message: 'Failed to delete key'});
      }
    } catch (err) {
      setResultModal({show: true, type: 'error', message: 'Failed to delete key'});
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">API Keys</h4>
          <p className="mb-0 text-muted">Manage API access</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          Generate Key
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="ti ti-alert-triangle me-2"></i>
            Keep your API keys secure. Never share them publicly.
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="fw-semibold">{key.name}</td>
                    <td><code className="small">{key.key}</code></td>
                    <td className="small">{key.created}</td>
                    <td className="small">{key.lastUsed}</td>
                    <td>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(key.key);
                          setResultModal({show: true, type: 'success', message: '✅ API Key copied to clipboard!'});
                        }}
                        className="btn btn-sm btn-text-secondary me-1"
                      >
                        <i className="ti ti-copy"></i>
                      </button>
                      <button
                        onClick={() => {
                          const confirmModal = document.createElement('div');
                          confirmModal.className = 'modal fade show d-block';
                          confirmModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                          confirmModal.innerHTML = `
                            <div class="modal-dialog modal-dialog-centered">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h5 class="modal-title">Delete API Key</h5>
                                  <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                                </div>
                                <div class="modal-body">Are you sure you want to delete this API key? This action cannot be undone.</div>
                                <div class="modal-footer">
                                  <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                                  <button type="button" class="btn btn-danger" onclick="window.deleteKey('${key.id}'); this.closest('.modal').remove();">Delete</button>
                                </div>
                              </div>
                            </div>
                          `;
                          (window as any).deleteKey = () => handleDelete(key.id);
                          document.body.appendChild(confirmModal);
                        }}
                        className="btn btn-sm btn-text-danger"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ApiKeyModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerate}
      />

      <Modal
        show={resultModal.show}
        onClose={() => setResultModal({...resultModal, show: false})}
        onConfirm={() => setResultModal({...resultModal, show: false})}
        title={resultModal.type === 'success' ? 'Success' : 'Error'}
        message={resultModal.message}
        confirmText="OK"
        type={resultModal.type}
      />
    </div>
  );
}

