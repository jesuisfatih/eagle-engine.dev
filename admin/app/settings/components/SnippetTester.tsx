'use client';

import { useState } from 'react';

export default function SnippetTester() {
  const [testResult, setTestResult] = useState('');

  const testSnippet = async () => {
    try {
      const response = await fetch('https://cdn.eagledtfsupply.com/snippet.iife.js');
      if (response.ok) {
        const code = await response.text();
        setTestResult(`✅ Snippet loaded successfully (${code.length} bytes)`);
      } else {
        setTestResult('❌ Snippet not accessible');
      }
    } catch (err: any) {
      setTestResult('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Snippet Test</h6>
      </div>
      <div className="card-body">
        <button onClick={testSnippet} className="btn btn-primary">
          <i className="ti ti-code me-1"></i>
          Test Snippet
        </button>
        {testResult && (
          <div className={`alert mt-3 ${testResult.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}

