import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, entityName }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid #f1f5f9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#fef2f2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#ef4444" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>
              Delete Lead
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex',
              padding: '0.25rem',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            Are you sure you want to delete the lead <strong>{entityName}</strong>? This action cannot be undone and will permanently remove all associated intelligence, scores, and activity logs.
          </p>
        </div>

        {/* Footer actions */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          background: '#f8fafc', 
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button 
            onClick={onClose}
            className="btn-light-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ 
              background: '#ef4444', 
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
            }}
          >
            <Trash2 size={16} /> Yes, Delete Lead
          </button>
        </div>
      </div>
      
      {/* Inline styles for modal animation */}
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
