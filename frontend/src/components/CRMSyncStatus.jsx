import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Database,
  Filter
} from 'lucide-react';

export default function CRMSyncStatus({ crmLogs, onTriggerSync, isSyncing }) {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

  const getBadgeStyle = (actionTag) => {
    switch (actionTag) {
      case 'Added':
        return { background: '#dcfce7', color: '#15803d' };
      case 'Updated':
        return { background: '#dbeafe', color: '#1d4ed8' };
      case 'Moved':
        return { background: '#f3e8ff', color: '#7c3aed' };
      case 'Synced':
        return { background: '#dcfce7', color: '#15803d' };
      case 'New':
        return { background: '#ccfbf1', color: '#0f766e' };
      default:
        return { background: '#f1f5f9', color: '#475569' };
    }
  };

  const filteredLogs = crmLogs.filter(log => {
    const logPlatform = (log.platform || '').toLowerCase();
    const matchesPlatform = platformFilter === 'All' || logPlatform === platformFilter.toLowerCase();
    
    if (!searchQuery.trim()) return matchesPlatform;
    
    const query = searchQuery.trim().toLowerCase();
    return matchesPlatform && (
      (log.type || '').toLowerCase().includes(query) ||
      (log.contactName || '').toLowerCase().includes(query) ||
      (log.contactRole || '').toLowerCase().includes(query) ||
      (log.platform || '').toLowerCase().includes(query) ||
      (log.details || '').toLowerCase().includes(query)
    );
  });

  const resetFilters = () => {
    setPlatformFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="pdf-panel-card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header matching PDF page 4 screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={17} color="#2563eb" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              CRM Sync Simulation
            </h3>
            <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
              Salesforce & HubSpot Bi-directional Sync
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Auto Sync Slider Toggle */}
          <div 
            onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}
            title="Toggle Auto-Sync"
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Auto</span>
            <div style={{
              width: '28px',
              height: '16px',
              background: isAutoSyncEnabled ? '#2563eb' : '#cbd5e1',
              borderRadius: '20px',
              position: 'relative',
              transition: 'background 0.2s ease'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isAutoSyncEnabled ? '14px' : '2px',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }} />
            </div>
          </div>

          <span className="badge-synced-green">
            <CheckCircle2 size={13} /> Synced
          </span>
          <button 
            onClick={onTriggerSync}
            disabled={isSyncing}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#334155'
            }}
            title="Trigger Instant CRM Sync"
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-animation' : ''} />
            {isSyncing ? 'Syncing' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Platform Filter & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search CRM logs (name, details, action)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem 0.35rem 1.75rem',
              fontSize: '0.75rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Filter size={11} /> Platform:
          </span>
          {['All', 'Salesforce', 'HubSpot'].map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              style={{
                background: platformFilter === p ? '#2563eb' : '#f1f5f9',
                color: platformFilter === p ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '0.2rem 0.625rem',
                borderRadius: '5px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Log Stream matching PDF page 4 screenshot */}
      <div className="custom-scrollbar" style={{ flex: 1, maxHeight: '480px', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.875rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'border-color 0.15s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  {log.type}
                </div>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  ...getBadgeStyle(log.actionTag)
                }}>
                  {log.actionTag}
                </span>
              </div>

              <div style={{ fontSize: '0.78125rem', color: '#475569', lineHeight: '1.4' }}>
                {log.contactName}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {log.contactRole}
              </div>

              {log.details && (
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.375rem', fontStyle: 'italic' }}>
                  {log.details}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.375rem', borderTop: '1px solid #f1f5f9', fontSize: '0.6875rem', color: '#94a3b8' }}>
                <span style={{ fontWeight: 700, color: log.platform === 'Salesforce' ? '#2563eb' : '#ea580c' }}>
                  {log.platform}
                </span>
                <span>{log.timeAgo}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem' }}>
            <Database size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>No CRM sync logs match active filters</p>
            <button 
              onClick={resetFilters}
              style={{
                marginTop: '0.625rem',
                background: '#e0f2fe',
                color: '#0284c7',
                border: 'none',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

