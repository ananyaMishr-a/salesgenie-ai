import React, { useState } from 'react';
import { X, SlidersHorizontal, CheckCircle2, Database, Settings2 } from 'lucide-react';

export default function CRMSettingsModal({ isOpen, onClose }) {
  const [salesforceConnected, setSalesforceConnected] = useState(true);
  const [hubspotConnected, setHubspotConnected] = useState(true);
  const [syncInterval, setSyncInterval] = useState('5');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('connectors'); // 'connectors' | 'field_mapping'

  // Custom Field Mappings state
  const [fieldMappings, setFieldMappings] = useState({
    qualificationScore: 'AI_Qualification_Score__c',
    summaryText: 'Call_Executive_Summary__c',
    actionItems: 'CRM_Followup_Tasks__c',
    dealStage: 'Pipeline_Stage__c'
  });

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
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
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        padding: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.375rem', borderRadius: '8px', background: '#dbeafe', color: '#1d4ed8' }}>
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                CRM Integration & Sync Settings
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Configure platform connectors, webhook listeners & custom field mappings
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('connectors')}
            style={{
              background: activeTab === 'connectors' ? '#eff6ff' : 'transparent',
              color: activeTab === 'connectors' ? '#2563eb' : '#64748b',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Database size={14} /> CRM Connectors
          </button>
          <button
            onClick={() => setActiveTab('field_mapping')}
            style={{
              background: activeTab === 'field_mapping' ? '#eff6ff' : 'transparent',
              color: activeTab === 'field_mapping' ? '#2563eb' : '#64748b',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Settings2 size={14} /> Custom Field Mappings
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeTab === 'connectors' ? (
            <>
              {/* Salesforce Connector Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontWeight: 800, fontSize: '0.875rem' }}>
                    SF
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Salesforce Enterprise Org
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      OAuth 2.0 Connected • Org ID: SF-8849
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSalesforceConnected(!salesforceConnected)}
                  style={{
                    background: salesforceConnected ? '#dcfce7' : '#f1f5f9',
                    color: salesforceConnected ? '#15803d' : '#64748b',
                    border: salesforceConnected ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {salesforceConnected && <CheckCircle2 size={13} />}
                  {salesforceConnected ? 'Connected' : 'Connect'}
                </button>
              </div>

              {/* HubSpot Connector Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2410c', fontWeight: 800, fontSize: '0.875rem' }}>
                    HS
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      HubSpot Professional CRM
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      API Token Synced • Portal ID: HS-3021
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHubspotConnected(!hubspotConnected)}
                  style={{
                    background: hubspotConnected ? '#dcfce7' : '#f1f5f9',
                    color: hubspotConnected ? '#15803d' : '#64748b',
                    border: hubspotConnected ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {hubspotConnected && <CheckCircle2 size={13} />}
                  {hubspotConnected ? 'Connected' : 'Connect'}
                </button>
              </div>

              {/* Sync Frequency Select */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>
                  Auto Sync Schedule Interval
                </label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                >
                  <option value="1">Real-time Webhook Stream (Instant)</option>
                  <option value="5">Every 5 Minutes (Recommended)</option>
                  <option value="15">Every 15 Minutes</option>
                  <option value="60">Hourly Sync</option>
                </select>
              </div>

              {/* Webhook Endpoint Display */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>
                  SalesGenie Inbound Webhook URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://api.salesgenie.ai/v1/webhooks/salesforce"
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#0284c7'
                  }}
                />
              </div>
            </>
          ) : (
            /* Field Mapping Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Lead Qualification Score Target Field
                </label>
                <input
                  type="text"
                  value={fieldMappings.qualificationScore}
                  onChange={(e) => setFieldMappings({ ...fieldMappings, qualificationScore: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Call Executive Summary Field
                </label>
                <input
                  type="text"
                  value={fieldMappings.summaryText}
                  onChange={(e) => setFieldMappings({ ...fieldMappings, summaryText: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Action Items Task Sync Object
                </label>
                <input
                  type="text"
                  value={fieldMappings.actionItems}
                  onChange={(e) => setFieldMappings({ ...fieldMappings, actionItems: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Pipeline Deal Stage Sync Field
                </label>
                <input
                  type="text"
                  value={fieldMappings.dealStage}
                  onChange={(e) => setFieldMappings({ ...fieldMappings, dealStage: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-light-secondary" style={{ padding: '0.5rem 1rem' }}>
              Close
            </button>
            <button type="submit" className="btn-blue-primary">
              {saved ? 'Saved!' : 'Save Integration Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

