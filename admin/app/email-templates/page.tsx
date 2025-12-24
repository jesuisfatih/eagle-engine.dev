'use client';

import { useState } from 'react';
import EmailTemplateModal from '@/components/EmailTemplateModal';
import Modal from '@/components/Modal';

interface EmailTemplateData {
  type: string;
  subject: string;
  body: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplateData[]>([
    { type: 'invitation', subject: 'You\'re invited to join Eagle B2B', body: 'Welcome! Click the link below...' },
    { type: 'confirmation', subject: 'Order Confirmed', body: 'Thank you for your order...' },
  ]);
  const [editModal, setEditModal] = useState<{show: boolean; template: EmailTemplateData | null}>({show: false, template: null});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  const handleSave = (updatedTemplate: EmailTemplateData) => {
    const updated = templates.map(t => 
      t.type === updatedTemplate.type ? updatedTemplate : t
    );
    setTemplates(updated);
    setResultModal({show: true, message: '✅ Template updated successfully!'});
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Email Templates</h4>

      <div className="row g-4">
        {templates.map((template) => (
          <div key={template.type} className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h6 className="card-title mb-0">
                  {template.type === 'invitation' ? 'Company Invitation' : 'Order Confirmation'}
                </h6>
                <button
                  onClick={() => setEditModal({show: true, template})}
                  className="btn btn-sm btn-primary"
                >
                  <i className="ti ti-edit me-1"></i>Edit
                </button>
              </div>
              <div className="card-body">
                <div className="bg-lighter p-3 rounded">
                  <p className="small mb-1"><strong>Subject:</strong> {template.subject}</p>
                  <p className="small mb-0"><strong>Body:</strong> {template.body}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EmailTemplateModal
        show={editModal.show}
        template={editModal.template}
        onClose={() => setEditModal({show: false, template: null})}
        onSave={handleSave}
      />

      <Modal
        show={resultModal.show}
        onClose={() => setResultModal({show: false, message: ''})}
        onConfirm={() => setResultModal({show: false, message: ''})}
        title="Success"
        message={resultModal.message}
        confirmText="OK"
        type="success"
      />
    </div>
  );
}

