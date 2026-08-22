import React from 'react';
import { MessageSquareText } from 'lucide-react';

export default function Milestone3Banner() {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Milestone 3 Capsule Tag matching PDF Page 4 screenshot */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--pill-bg)', color: 'var(--pill-text)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
        <MessageSquareText size={13} />
        MILESTONE 3 • WEEKS 5-6
      </div>

      {/* Main Title */}
      <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        CRM Integration & Conversation Intelligence
      </h2>

      {/* Subtitle */}
      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
        Sync with CRM and extract insights from sales conversations
      </p>
    </div>
  );
}
