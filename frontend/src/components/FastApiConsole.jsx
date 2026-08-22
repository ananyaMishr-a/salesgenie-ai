import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { fastApiEndpoints } from '../data/mockData';

export default function FastApiConsole({ isOpen, onClose }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(fastApiEndpoints[0]);
  const [requestPayload, setRequestPayload] = useState(JSON.stringify(fastApiEndpoints[0].samplePayload, null, 2));
  const [responseOutput, setResponseOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'curl'
  const [simulatedStatus, setSimulatedStatus] = useState(200); // 200 | 400 | 500

  if (!isOpen) return null;

  const handleSelectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.samplePayload, null, 2));
    setResponseOutput(null);
  };

  const handleRunRequest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      if (simulatedStatus === 200) {
        setResponseOutput({
          statusCode: 200,
          statusText: "OK",
          responseTimeMs: Math.floor(Math.random() * 80) + 320,
          headers: {
            "content-type": "application/json",
            "server": "uvicorn/FastAPI 0.110.0",
            "x-process-time-seconds": "0.342"
          },
          body: selectedEndpoint.sampleResponse
        });
      } else if (simulatedStatus === 400) {
        setResponseOutput({
          statusCode: 400,
          statusText: "Bad Request",
          responseTimeMs: 120,
          headers: {
            "content-type": "application/json",
            "server": "uvicorn/FastAPI 0.110.0"
          },
          body: {
            detail: [
              { loc: ["body", "crm_platform"], msg: "Invalid CRM platform specified. Must be 'salesforce' or 'hubspot'", type: "value_error" }
            ]
          }
        });
      } else {
        setResponseOutput({
          statusCode: 500,
          statusText: "Internal Server Error",
          responseTimeMs: 450,
          headers: {
            "content-type": "application/json"
          },
          body: {
            error: "CRM API timeout during bi-directional synchronization",
            status_code: 500
          }
        });
      }
    }, 600);
  };

  const handleCopyJson = () => {
    if (responseOutput) {
      navigator.clipboard.writeText(JSON.stringify(responseOutput.body, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateCurlCommand = () => {
    return `curl -X '${selectedEndpoint.method}' \\\n  'https://api.salesgenie.ai${selectedEndpoint.path}' \\\n  -H 'accept: application/json' \\\n  -H 'Content-Type: application/json' \\\n  -d '${requestPayload.replace(/\n/g, '')}'`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="pdf-panel-card" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.375rem', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Terminal size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  FastAPI External Integration Console
                </h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                  REST & Webhook APIs
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Test Python FastAPI backend endpoints for CRM synchronization & conversation intelligence
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{
            width: '320px',
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem'
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Available Endpoints
            </div>
            {fastApiEndpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  style={{
                    background: isSelected ? '#ffffff' : 'transparent',
                    border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      background: ep.method === 'POST' ? '#dcfce7' : '#dbeafe',
                      color: ep.method === 'POST' ? '#15803d' : '#1d4ed8',
                      padding: '0.1rem 0.375rem',
                      borderRadius: '4px'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#2563eb' : '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#0f172a' : '#64748b' }}>
                    {ep.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Playground Area */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>
                  {selectedEndpoint.method} {selectedEndpoint.path}
                </span>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                  {selectedEndpoint.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={simulatedStatus}
                  onChange={(e) => setSimulatedStatus(Number(e.target.value))}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                >
                  <option value={200}>Simulate 200 OK</option>
                  <option value={400}>Simulate 400 Bad Request</option>
                  <option value={500}>Simulate 500 Server Error</option>
                </select>

                <button
                  onClick={handleRunRequest}
                  disabled={isExecuting}
                  className="btn-blue-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                >
                  <Play size={14} />
                  {isExecuting ? 'Sending...' : 'Test Endpoint'}
                </button>
              </div>
            </div>

            {/* Toggle Tabs: JSON Payload vs cURL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('json')}
                style={{
                  background: activeTab === 'json' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'json' ? '#2563eb' : '#64748b',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <Code2 size={13} /> Request Body (JSON)
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                style={{
                  background: activeTab === 'curl' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'curl' ? '#2563eb' : '#64748b',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <FileCode size={13} /> cURL Command
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: '300px' }}>
              {activeTab === 'json' ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.375rem' }}>
                    Payload Input
                  </label>
                  <textarea
                    value={requestPayload}
                    onChange={(e) => setRequestPayload(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      color: '#0f172a',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.375rem' }}>
                    Executable cURL Command
                  </label>
                  <pre style={{
                    flex: 1,
                    background: '#0f172a',
                    color: '#38bdf8',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto'
                  }}>
                    {generateCurlCommand()}
                  </pre>
                </div>
              )}

              {/* Response Output Panel */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Server size={14} /> Response Output
                  </label>
                  {responseOutput && (
                    <button
                      onClick={handleCopyJson}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {copied ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy Response'}
                    </button>
                  )}
                </div>

                <div style={{
                  flex: 1,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  overflow: 'auto'
                }}>
                  {responseOutput ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.375rem' }}>
                        <span style={{
                          fontWeight: 700,
                          color: responseOutput.statusCode === 200 ? '#15803d' : '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {responseOutput.statusCode === 200 ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          HTTP {responseOutput.statusCode} {responseOutput.statusText}
                        </span>
                        <span style={{ color: '#64748b' }}>
                          Time: {responseOutput.responseTimeMs} ms
                        </span>
                      </div>
                      <pre style={{ color: responseOutput.statusCode === 200 ? '#0284c7' : '#e11d48' }}>
                        {JSON.stringify(responseOutput.body, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center' }}>
                      <Zap size={24} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                      <p>Click "Test Endpoint" to simulate FastAPI request</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

