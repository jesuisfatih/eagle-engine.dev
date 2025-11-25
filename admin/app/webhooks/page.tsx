'use client';

import { useState, useEffect } from 'react';

export default function WebhooksPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/events/company?eventType=webhook&limit=50`);
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogs([]);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Webhook Logs</h4>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <p className="text-muted mb-0">No webhook events yet</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-semibold">{log.eventType}</td>
                      <td className="small">{new Date(log.createdAt).toLocaleString()}</td>
                      <td><span className="badge bg-label-success">Success</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

