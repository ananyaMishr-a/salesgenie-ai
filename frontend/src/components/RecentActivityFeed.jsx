import React, { useState } from 'react';
import { 
  Activity, 
  MailCheck, 
  PhoneCall, 
  CalendarCheck, 
  StickyNote, 
  Send, 
  Plus,
  UserCheck,
  FileText
} from 'lucide-react';
import { formatIST } from '../api/leadsApi';

export default function RecentActivityFeed({ activities = [], onAddActivityNote, currentCompany = 'Sales Pipeline' }) {
  const [noteText, setNoteText] = useState('');

  const getIcon = (iconName) => {
    const props = { size: 14 };
    switch (iconName) {
      case 'MailCheck': return <MailCheck {...props} color="#2563eb" />;
      case 'PhoneCall': return <PhoneCall {...props} color="#059669" />;
      case 'CalendarCheck': return <CalendarCheck {...props} color="#7c3aed" />;
      case 'StickyNote': return <StickyNote {...props} color="#b45309" />;
      case 'Send': return <Send {...props} color="#0284c7" />;
      case 'UserCheck': return <UserCheck {...props} color="#16a34a" />;
      case 'FileText': return <FileText {...props} color="#9333ea" />;
      default: return <Activity {...props} color="#64748b" />;
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const now = new Date();
    onAddActivityNote({
      id: `ra-${Date.now()}`,
      type: 'Note Added',
      title: `Note: "${noteText}"`,
      company: currentCompany,
      timestamp: now.toISOString(),
      timeAgo: formatIST(now),
      icon: 'StickyNote'
    });

    setNoteText('');
  };

  return (
    <div className="pdf-panel-card" style={{ padding: '1.25rem', height: '100%', maxHeight: '640px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          Recent Activity
        </h3>
        <span style={{ fontSize: '0.6875rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>
          {activities.length} Events
        </span>
      </div>

      {/* Activity Timeline Stream */}
      <div className="custom-scrollbar" style={{ flex: 1, maxHeight: '460px', minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto', paddingRight: '6px', marginBottom: '1rem' }}>
        {activities.length > 0 ? (
          activities.map((item) => (
            <div key={item.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem 0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem'
            }}>
              <div style={{
                padding: '0.375rem',
                borderRadius: '6px',
                background: '#f1f5f9',
                marginTop: '0.125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getIcon(item.icon)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', lineHeight: '1.4' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.6875rem', color: '#64748b' }}>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>{item.company || currentCompany}</span>
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' }}>
            No recent activity recorded yet. Add a note below to record timeline events.
          </div>
        )}
      </div>

      {/* Quick Add Note Form */}
      <form onSubmit={handleAddNote} style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Add note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.4rem 0.625rem',
              fontSize: '0.78125rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-blue-primary" style={{ padding: '0.4rem 0.625rem', fontSize: '0.75rem' }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </form>
    </div>
  );
}
