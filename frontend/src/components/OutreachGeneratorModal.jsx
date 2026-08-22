import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';

export default function OutreachGeneratorModal({ isOpen, onClose, prospect }) {
  const [subject, setSubject] = useState('Transform Your Data Pipeline with AI');
  const [emailBody, setEmailBody] = useState(
    `Hi ${prospect?.contactName?.split(' ')[0] || 'there'},\n\nI noticed ${prospect?.company || 'your company'} recently secured ${prospect?.funding || 'new funding'} – congratulations on the milestone! As you scale operations, managing data efficiently becomes critical.\n\nOur platform has helped similar ${prospect?.tier || 'Enterprise'} software companies reduce data processing time by 65% while cutting infrastructure costs by 40%. With your focus on cloud-native solutions, our AI-powered intelligence engine syncs natively into Salesforce in under 5 minutes.\n\nWould you be open to a quick 15-minute intro call next Tuesday at 10:00 AM?\n\nBest regards,\nAlex Thompson`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} color="#7c3aed" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
              AI Email Generator for {prospect?.company}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge-ai-purple">AI Powered</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>To:</label>
            <input
              type="text"
              readOnly
              value={`${prospect?.contactName} <${prospect?.contactName?.split(' ')[0].toLowerCase()}@${prospect?.company?.replace(/\s+/g, '').toLowerCase()}.com>`}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#0f172a', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#0f172a', outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Message Body:</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              style={{ width: '100%', height: '240px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8125rem', color: '#0f172a', lineHeight: '1.5', resize: 'none', outline: 'none' }}
            />
            {isGenerating && (
              <div style={{ position: 'absolute', inset: '1.25rem 0 0 0', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#7c3aed' }}>
                  <RefreshCw size={24} className="spin-animation" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Optimizing with AI...</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              <RefreshCw size={14} className={isGenerating ? 'spin-animation' : ''} />
              Regenerate (AI)
            </button>
            <button
              onClick={handleCopy}
              className="btn-blue-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.25rem' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard' : 'Copy Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
