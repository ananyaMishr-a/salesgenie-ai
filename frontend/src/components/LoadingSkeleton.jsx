import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton({ message = 'Loading module resources...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2.5rem',
      }}
    >
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Loader2 size={36} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
      </div>

      <div
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.375rem',
        }}
      >
        SalesGenie AI
      </div>

      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{message}</div>
    </div>
  );
}
