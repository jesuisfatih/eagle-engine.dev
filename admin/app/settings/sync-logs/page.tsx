'use client';

import { useState, useEffect } from 'react';

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/sync/status`);
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogs([]);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Sync Logs</h4>
      
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Records</th>
                  <th>Started</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <p className="text-muted mb-0">No sync logs yet</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-semibold">{log.syncType}</td>
                      <td>
                        <span className={`badge ${log.status === 'completed' ? 'bg-label-success' : log.status === 'failed' ? 'bg-label-danger' : 'bg-label-warning'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.recordsProcessed} / {log.recordsFailed} failed</td>
                      <td className="small">{new Date(log.startedAt).toLocaleString()}</td>
                      <td className="small">
                        {log.completedAt ? 
                          `${Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s` 
                          : 'Running...'}
                      </td>
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

