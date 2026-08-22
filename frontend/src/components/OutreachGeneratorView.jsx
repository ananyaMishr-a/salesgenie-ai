import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  ArrowLeft,
  Building2,
  PieChart,
  Briefcase,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { generateOutreachEmail, fetchOutreachStrategy } from '../api/outreachApi';

export default function OutreachGeneratorView({ prospect, onBack }) {
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [strategy, setStrategy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  const contactFirstName = prospect?.contactName ? prospect.contactName.split(' ')[0] : 'there';
  const companyName = prospect?.company || 'your company';
  const industryName = prospect?.industry || 'Technology';
  const fundingStage = prospect?.funding || 'Enterprise';
  const techStackStr = prospect?.techStack && prospect.techStack.length > 0 ? prospect.techStack.join(', ') : 'modern tech';

  const STRATEGIES = ['techStack', 'painPoint', 'roi', 'growth', 'automation', 'personalizedInsight'];
  const [stratIndex, setStratIndex] = useState(0);

  const [error, setError] = useState(null);

  const runGeneration = async (toneToUse, forceNextStrat = false) => {
    setIsGenerating(true);
    setError(null);
    const tone = toneToUse || selectedTone;

    let targetStrat = STRATEGIES[stratIndex];
    if (forceNextStrat) {
      const nextIdx = (stratIndex + 1) % STRATEGIES.length;
      setStratIndex(nextIdx);
      targetStrat = STRATEGIES[nextIdx];
    }

    try {
      if (prospect?.id) {
        const [emailRes, stratRes] = await Promise.all([
          generateOutreachEmail(prospect.id, tone, targetStrat),
          fetchOutreachStrategy(prospect.id).catch(() => null)
        ]);

        if (emailRes && (emailRes.email_subject || emailRes.subject)) {
          setSubject(emailRes.email_subject || emailRes.subject);
          setEmailBody(emailRes.email_content || emailRes.content);
        } else {
          setError("AI email generation failed. Please try again.");
          setEmailBody("AI email generation failed. Please try again.");
        }
        if (stratRes) {
          setStrategy(stratRes);
        }
      }
    } catch (err) {
      console.error("Outreach generation error:", err);
      setError("AI email generation failed. Please try again.");
      setEmailBody("AI email generation failed. Please try again.");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 300);
    }
  };

  useEffect(() => {
    runGeneration(selectedTone, false);
  }, [prospect]);

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    runGeneration(tone, true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Outreach Generation & Lead Scoring
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Personalized email creation and AI-powered lead qualification
          </p>
        </div>
      </div>

      <div>
        <button onClick={onBack} className="btn-light-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>

      {/* 3-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.9fr 1fr',
        gap: '1.25rem',
        minHeight: '580px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: AI Email Generator */}
        <div className="pdf-panel-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>AI Email Generator</h3>
            <span className="badge-ai-purple">
              <Sparkles size={12} /> AI Powered
            </span>
          </div>

          {/* Tone Selector & Regenerate Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
              <span style={{ fontWeight: 600, marginRight: '0.25rem' }}>Tone:</span>
              {['Professional', 'Casual', 'Direct'].map(tone => {
                const isActive = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    style={{
                      background: isActive ? '#2563eb' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => runGeneration(selectedTone, true)}
              disabled={isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: isGenerating ? '#cbd5e1' : '#e0f2fe',
                color: isGenerating ? '#64748b' : '#0284c7',
                border: isGenerating ? '1px solid #cbd5e1' : '1px solid #bae6fd',
                padding: '0.25rem 0.625rem',
                borderRadius: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={12} className={isGenerating ? 'spin-animation' : ''} />
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {/* To Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.375rem 0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', width: '45px' }}>To:</label>
              <input
                type="text"
                readOnly
                value={`${contactFirstName.toLowerCase()}@${companyName.replace(/\s+/g, '').toLowerCase()}.com`}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600, outline: 'none' }}
              />
            </div>

            {/* Subject Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.375rem 0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', width: '45px' }}>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.8125rem', color: '#0f172a', outline: 'none', fontWeight: 700 }}
              />
            </div>

            {/* Email Body Textarea */}
            <div style={{ position: 'relative', flex: 1, minHeight: '220px' }}>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="custom-scrollbar"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '220px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8125rem',
                  color: '#334155',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              {isGenerating && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#2563eb' }}>
                    <RefreshCw size={24} className="spin-animation" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Crafting {selectedTone} Email...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar matching Page 4 Screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={handleCopy}
                className="btn-light-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
              >
                {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy Email'}
              </button>

              <button
                onClick={handleSaveDraft}
                className="btn-blue-primary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}
              >
                {savedDraft ? <CheckCircle2 size={14} /> : <Send size={14} />}
                {savedDraft ? 'Saved to Outreach Drafts!' : 'Save Outreach Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Lead Score */}
        <div className="pdf-panel-card custom-scrollbar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Lead Score</h3>
            <span className="badge-ai-purple">AI Powered</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="339" strokeDashoffset={`${339 - (339 * (prospect?.qualificationScore || 88)) / 100}`} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: '1' }}>{prospect?.qualificationScore || 88}</span>
              </div>
            </div>
            
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              <span>Conversion Probability</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{roundProb(prospect?.qualificationScore || 88)}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem' }}>
              <div style={{ width: `${roundProb(prospect?.qualificationScore || 88)}%`, height: '100%', background: '#22c55e', borderRadius: '3px' }} />
            </div>
          </div>

          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Scoring Factors</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem', borderRadius: '6px' }}><Building2 size={15} /></div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Company Size</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>+15 points</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem', borderRadius: '6px' }}><PieChart size={15} /></div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Funding Stage</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>+20 points</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem', borderRadius: '6px' }}><Briefcase size={15} /></div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Annual Revenue</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>+15 points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Outreach Strategy */}
        <div className="pdf-panel-card custom-scrollbar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>Outreach Strategy</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.875rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Follow-up Timing</div>
                <span style={{ fontSize: '0.625rem', background: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>HIGH</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                Connect within 24 hours of initial email. Tuesday mornings show highest response rates for {industryName} decision makers.
              </p>
              <div style={{ fontSize: '0.6875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                <Clock size={12} color="#2563eb" /> Optimal: Tuesday 10:00 AM
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.875rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Channel Mix</div>
                <span style={{ fontSize: '0.625rem', background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>MEDIUM</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                Follow up on LinkedIn within 48 hours referencing specific tech stack capabilities ({techStackStr}).
              </p>
              <div style={{ fontSize: '0.6875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                <RefreshCw size={12} color="#7c3aed" /> Multi-channel approach
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.875rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>Content Strategy</div>
                <span style={{ fontSize: '0.625rem', background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>MEDIUM</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                Share relevant ROI benchmark case studies tailored to {companyName}'s {fundingStage} stage.
              </p>
              <div style={{ fontSize: '0.6875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                <Briefcase size={12} color="#059669" /> Value-first approach
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundProb(score) {
  return Math.round(Math.min(95, score * 0.85));
}
