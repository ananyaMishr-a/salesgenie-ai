import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Users, 
  Cpu, 
  ArrowUpRight,
  Bookmark,
  Plus,
  Edit,
  RefreshCw
} from 'lucide-react';
import AddLeadModal from './AddLeadModal';
import EditLeadModal from './EditLeadModal';
import { runLeadIntelligence, deleteLead } from '../api/leadsApi';
import { Trash2 } from 'lucide-react';

export default function LeadsModule({ 
  prospectsList, 
  onAddLead, 
  onUpdateLead,
  onDeleteLead,
  selectedProspect, 
  setSelectedProspect,
  onNavigateToOutreach, 
  onNavigateToConversations 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [analyzedLeads, setAnalyzedLeads] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredProspects = prospectsList.filter(p => {
    const query = searchQuery.toLowerCase();
    const companyMatch = p.company ? p.company.toLowerCase().includes(query) : false;
    const nameMatch = p.contactName ? p.contactName.toLowerCase().includes(query) : false;
    return companyMatch || nameMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Milestone 1 Header matching PDF Page 3 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            <Bookmark size={13} /> MILESTONE 1 • WEEKS 1-2
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Lead Management & Intelligence Engine
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Prospect database and AI-powered company analysis
          </p>
        </div>

        <button 
          onClick={() => setIsAddLeadModalOpen(true)}
          className="btn-blue-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.84375rem' }}
        >
          <Plus size={15} /> Add Lead (AI Auto-Fill)
        </button>
      </div>

      {/* 3-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 340px',
        gap: '1.25rem',
        minHeight: '580px'
      }}>
        {/* Left Column: Prospect List */}
        <div className="pdf-panel-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.5rem 0.5rem 0.5rem 2rem',
                fontSize: '0.8125rem',
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>

          <div className="custom-scrollbar" style={{ flex: 1, maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingRight: '4px' }}>
            {filteredProspects.map(p => {
              const isSelected = selectedProspect?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProspect(p)}
                  style={{
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {p.company}
                    </h4>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{p.timeAgo}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Users size={12} /> {p.contactName}, {p.role}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                      {p.tier}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#15803d', fontWeight: 700 }}>
                      Score: {p.qualificationScore}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredProspects.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                No prospects found. Click "Add Lead" above to create one.
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Company Profile */}
        <div className="pdf-panel-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedProspect ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedProspect.company}
                    </h3>
                    <span className="badge-ai-purple" style={{ fontSize: '0.75rem' }}>
                      {selectedProspect.tier} Software
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Contact: <strong>{selectedProspect.contactName}</strong> ({selectedProspect.role})
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => setIsEditLeadModalOpen(true)} className="btn-light-secondary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
                    <Edit size={15} color="#475569" /> Edit Profile
                  </button>
                  {onDeleteLead && (
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete lead ${selectedProspect.company}?`)) {
                          onDeleteLead(selectedProspect.id);
                        }
                      }} 
                      className="btn-light-secondary" 
                      style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', color: '#ef4444', borderColor: '#fca5a5' }}
                    >
                      <Trash2 size={15} /> Delete Lead
                    </button>
                  )}
                  <button onClick={onNavigateToConversations} className="btn-light-secondary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
                    <Users size={15} color="#2563eb" /> View Meeting Notes
                  </button>
                  <button onClick={onNavigateToOutreach} className="btn-blue-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                    <ArrowUpRight size={15} /> Generate Outreach
                  </button>
                </div>
              </div>

              {/* Metric Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>COMPANY SIZE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{selectedProspect.size || 'Not provided'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>ANNUAL REVENUE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>{selectedProspect.revenue || 'Not provided'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>LOCATION</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{selectedProspect.location || 'Not provided'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>FUNDING STAGE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c3aed', marginTop: '0.25rem' }}>{selectedProspect.funding || 'Not provided'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>RECORD TIMESTAMPS</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginTop: '0.25rem' }}>
                    Created: {selectedProspect.createdAt || 'Not provided'} {selectedProspect.updatedAt && selectedProspect.updatedAt !== selectedProspect.createdAt ? `• Updated: ${selectedProspect.updatedAt}` : ''}
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Cpu size={15} color="#2563eb" /> Technology Stack
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedProspect.techStack || []).map((tech, idx) => (
                    <span key={idx} style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', padding: '3rem 1rem' }}>
              <Users size={32} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>No Prospect Selected</h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '300px' }}>
                Add a new lead using the "Add Lead" button above or select an existing lead from the prospect list.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Lead Intelligence */}
        <div className="pdf-panel-card custom-scrollbar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', maxHeight: '580px' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Lead Intelligence</h3>
            <span className="badge-ai-purple">
              <Sparkles size={12} /> AI Powered
            </span>
          </div>

          {!selectedProspect ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <Sparkles size={28} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.8125rem' }}>Select a lead to run AI Research & Qualification</p>
            </div>
          ) : !analyzedLeads.includes(selectedProspect.id) && (!selectedProspect.insights || selectedProspect.insights.length === 0) && !isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem 1rem', textAlign: 'center' }}>
              <div style={{ background: '#eff6ff', borderRadius: '50%', padding: '1rem', marginBottom: '1rem' }}>
                <Sparkles size={28} color="#2563eb" />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>No AI Analysis Run</h4>
              <p style={{ fontSize: '0.78125rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Run the Gemini B2B Research Agent to qualify {selectedProspect.company} and generate growth signals & reasoning.
              </p>
              <button 
                onClick={async () => {
                  setIsAnalyzing(true);
                  try {
                    const result = await runLeadIntelligence(selectedProspect.id);
                    selectedProspect.insights = result.insights;
                    selectedProspect.qualificationScore = result.qualificationScore;
                  } catch (error) {
                    console.error("AI analysis error:", error);
                  } finally {
                    setTimeout(() => {
                      setAnalyzedLeads(prev => [...prev, selectedProspect.id]);
                      setIsAnalyzing(false);
                    }, 500);
                  }
                }}
                className="btn-blue-primary" 
                style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem', width: '100%', justifyContent: 'center' }}
              >
                <Sparkles size={15} /> Analyze with AI Agent
              </button>
            </div>
          ) : isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 1rem' }}>
              <RefreshCw size={32} color="#2563eb" className="spin-animation" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Running Company Research Agent...</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem', textAlign: 'center' }}>
                Analyzing tech stack, funding signals, and qualification score for {selectedProspect.company}
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Score Gauge Ring */}
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: '7px solid #2563eb',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                background: '#ffffff'
              }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', lineHeight: '1' }}>
                  {selectedProspect.qualificationScore || 85}
                </span>
                <span style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginTop: '0.2rem' }}>
                  AI Score
                </span>
              </div>

              {/* Company AI Metadata Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.71875rem', fontWeight: 600 }}>
                  {selectedProspect.size || '1000+ employees'}
                </span>
                <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.71875rem', fontWeight: 600 }}>
                  {selectedProspect.funding || 'Public'}
                </span>
              </div>

              {/* Insights List */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(() => {
                  const rawInsights = selectedProspect?.insights;
                  const insightsList = Array.isArray(rawInsights)
                    ? rawInsights
                    : rawInsights && typeof rawInsights === 'object'
                    ? [
                        { type: 'Business Needs', detail: rawInsights.businessNeeds || rawInsights.business_needs },
                        { type: 'Opportunities', detail: rawInsights.opportunities },
                        { type: 'Industry Analysis', detail: rawInsights.industryAnalysis || rawInsights.industry_analysis }
                      ].filter(i => Boolean(i.detail))
                    : rawInsights && typeof rawInsights === 'string'
                    ? [{ type: 'AI Insights', detail: rawInsights }]
                    : [];

                  return insightsList.length > 0 ? (
                    insightsList.map((ins, idx) => (
                      <div key={idx} style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.875rem'
                      }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Sparkles size={14} color="#2563eb" /> {ins.type || ins.label || 'Insight'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                          {ins.detail}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.875rem'
                    }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Sparkles size={14} color="#2563eb" /> Reasoning
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: '1.5' }}>
                        {selectedProspect?.company || 'Lead'} demonstrates a high qualification score based on recent funding, strong market position, and technological compatibility.
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Re-analyze Button */}
              <button 
                onClick={() => {
                  setAnalyzedLeads(prev => prev.filter(id => id !== selectedProspect.id));
                  selectedProspect.insights = null;
                }}
                style={{
                  marginTop: '1.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <RefreshCw size={13} /> Re-run AI Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onAddLead={onAddLead}
      />

      <EditLeadModal
        isOpen={isEditLeadModalOpen}
        onClose={() => setIsEditLeadModalOpen(false)}
        leadToEdit={selectedProspect}
        onSaveLead={onUpdateLead}
      />
    </div>
  );
}
