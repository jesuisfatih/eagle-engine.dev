'use client';

import { useState } from 'react';
import RoleEditModal from '@/components/RoleEditModal';
import Modal from '@/components/Modal';
import type { RolePermission } from '@/types';

interface Role {
  name: string;
  permissions: string[];
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([
    { name: 'Admin', permissions: ['all'] },
    { name: 'Manager', permissions: ['orders', 'approve', 'team'] },
    { name: 'Buyer', permissions: ['orders', 'cart'] },
    { name: 'Viewer', permissions: ['view'] },
  ]);
  const [editModal, setEditModal] = useState<{show: boolean; role: Role | null}>({show: false, role: null});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  const handleSave = (role: RolePermission, newPermissions: string[]) => {
    const updated = roles.map(r => 
      r.name === role.name ? {...r, permissions: newPermissions} : r
    );
    setRoles(updated);
    setResultModal({show: true, message: `✅ ${role.name} permissions updated!`});
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Roles & Permissions</h4>

      <div className="row g-4">
        {roles.map((role) => (
          <div key={role.name} className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h6 className="card-title mb-0">{role.name}</h6>
                <button
                  onClick={() => setEditModal({show: true, role})}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="badge bg-label-info">{perm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RoleEditModal
        show={editModal.show}
        role={editModal.role}
        onClose={() => setEditModal({show: false, role: null})}
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

