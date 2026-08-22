import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { presetTranscripts } from '../data/mockData';
import { submitConversationTranscript, mapConversationFromApi } from '../api/conversationsApi';

export default function NewConversationModal({ isOpen, onClose, onAddMeeting, selectedProspect, prospectsList = [] }) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const syncLeadDetails = (leadId, list = prospectsList) => {
    const found = list.find(p => String(p.id) === String(leadId));
    if (found) {
      setSelectedLeadId(found.id);
      setClientName(found.contactName || found.contact_name || 'Prospect Contact');
      setCompany(found.company || found.company_name || 'Enterprise Company');
      setRole(found.role || found.contactTitle || 'Decision Maker');
    }
  };

  useEffect(() => {
    if (selectedProspect?.id) {
      syncLeadDetails(selectedProspect.id, prospectsList);
    } else if (prospectsList.length > 0) {
      syncLeadDetails(prospectsList[0].id, prospectsList);
    }
  }, [selectedProspect, prospectsList]);

  if (!isOpen) return null;

  const steps = [
    "Ingesting audio transcript payload...",
    "Running LLM sentiment & intent classification...",
    "Extracting key discussion points & pain points...",
    "Synthesizing CRM action items & due dates..."
  ];

  const handleSelectPreset = (preset) => {
    setErrorMessage(null);
    setTranscriptText(preset.transcriptText);

    // Auto-match preset to database lead if present in prospectsList
    const foundLead = prospectsList.find(p => {
      const pComp = (p.company || p.company_name || '').toLowerCase();
      const presetComp = (preset.company || '').toLowerCase();
      const pName = (p.contactName || p.contact_name || '').toLowerCase();
      const presetName = (preset.clientName || '').toLowerCase();

      return (presetComp && pComp.includes(presetComp)) || (presetName && pName.includes(presetName));
    });

    if (foundLead) {
      syncLeadDetails(foundLead.id);
    } else {
      setClientName(preset.clientName);
      setCompany(preset.company);
      setRole(preset.clientRole);
    }
  };

  const handleLeadChange = (leadId) => {
    setErrorMessage(null);
    syncLeadDetails(leadId);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent duplicate API requests on double-click

    setErrorMessage(null);

    const actualLeadId = Number(selectedLeadId) || selectedProspect?.id;
    if (!actualLeadId) {
      setErrorMessage("Please select a target lead from the database first.");
      return;
    }

    if (!transcriptText.trim()) {
      setErrorMessage("Please enter or paste a meeting transcript first.");
      return;
    }

    setIsProcessing(true);
    setStepIndex(0);

    const targetLead = prospectsList.find(p => String(p.id) === String(actualLeadId)) || selectedProspect || { contactName: clientName, company, role };

    try {
      const aiResult = await submitConversationTranscript(actualLeadId, transcriptText, 'Call');
      const normalizedMeeting = mapConversationFromApi(aiResult, targetLead);

      setIsProcessing(false);
      onAddMeeting(normalizedMeeting);
      setTranscriptText('');
      onClose();
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to analyze conversation transcript. Please verify backend connection.");
    }
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
      <div className="pdf-panel-card custom-scrollbar" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        padding: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.375rem', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                AI Sales Conversation Analyzer
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Paste or select a call transcript to generate key points, sentiment, and CRM tasks.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Preset Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
            Or pick a sample meeting transcript preset:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {presetTranscripts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <FileText size={13} /> {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {prospectsList && prospectsList.length > 0 ? (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Target Lead (Database Source of Truth)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                {prospectsList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.company} ({p.contactName || 'No contact'}) - ID: {p.id}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ padding: '0.75rem', background: '#fffbebfb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#d97706', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> Please select a lead first.
            </div>
          )}

          {/* Auto-Synchronized Lead Details (Read-Only) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Client / Prospect Name
              </label>
              <input
                type="text"
                readOnly
                value={clientName}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#475569',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Company Name
              </label>
              <input
                type="text"
                readOnly
                value={company}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#475569',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Role / Title
              </label>
              <input
                type="text"
                readOnly
                value={role}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#475569',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Meeting Transcript / Audio Notes
            </label>
            <textarea
              rows={6}
              placeholder="Paste raw conversation text here..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.8125rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '0.875rem',
              color: '#dc2626',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div style={{
              background: '#f3e8ff',
              border: '1px solid #d8b4fe',
              borderRadius: '8px',
              padding: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#7c3aed',
              fontSize: '0.8125rem',
              fontWeight: 600
            }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>{steps[stepIndex]}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-light-secondary" style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-blue-primary"
              style={{
                background: isProcessing ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.3)',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              <Sparkles size={16} />
              {isProcessing ? 'Processing...' : 'Run AI Intelligence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
