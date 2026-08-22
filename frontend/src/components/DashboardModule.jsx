import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Bookmark,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { 
  fetchDashboardKPIs, 
  fetchDashboardPipeline, 
  fetchDashboardRecommendations 
} from '../api/dashboardApi';

export default function DashboardModule({ leadsList = [], onUpdateLead, onNavigateToConversations }) {
  const [pipelineFilter, setPipelineFilter] = useState('This Month');
  const [kpis, setKpis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDashboardState = async () => {
    try {
      const [kpiRes, recRes] = await Promise.all([
        fetchDashboardKPIs().catch(() => null),
        fetchDashboardRecommendations().catch(() => null)
      ]);

      if (kpiRes) setKpis(kpiRes);
      if (recRes) setRecommendations(recRes);
    } catch (err) {
      console.warn('[SalesGenie Dashboard] API fallback active.', err);
    }
  };

  useEffect(() => {
    fetchDashboardState();
  }, []);

  const handleRefreshAI = async () => {
    setIsRefreshing(true);
    await fetchDashboardState();
    setToastMessage('AI Analytics refreshed cleanly!');
    setTimeout(() => setToastMessage(null), 2500);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Derive pipeline totals & metrics from real database leads
  const totalPipelineValNum = (leadsList || []).reduce(
    (sum, l) => sum + (Number(l.dealValue || l.deal_value) || 0),
    0
  );

  const fmtPipelineVal = totalPipelineValNum >= 1000000 
    ? `$${(totalPipelineValNum / 1000000).toFixed(1)}M`
    : totalPipelineValNum >= 1000 
    ? `$${Math.round(totalPipelineValNum / 1000)}K`
    : `$${totalPipelineValNum.toLocaleString()}`;

  const closedWonCount = (leadsList || []).filter(l => (l.stage || '').toLowerCase() === 'closed-won').length;
  const conversionRateStr = leadsList.length > 0 ? `${((closedWonCount / leadsList.length) * 100).toFixed(1)}%` : '0.0%';

  const metricCards = [
    {
      title: 'Conversion Rate',
      value: conversionRateStr,
      change: `${closedWonCount} of ${leadsList.length} leads closed`,
      isPositive: true,
      icon: TrendingUp,
      bgColor: '#dcfce7',
      iconColor: '#16a34a'
    },
    {
      title: 'Pipeline Value',
      value: fmtPipelineVal,
      change: `Total value across ${leadsList.length} active leads`,
      isPositive: true,
      icon: BarChart3,
      bgColor: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      title: 'Avg Response Time',
      value: kpis ? kpis.avg_response_time : 'Real-time AI',
      change: kpis ? kpis.response_change : 'Automated workflow',
      isPositive: true,
      icon: Clock,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed'
    },
    {
      title: 'Avg Sales Cycle',
      value: kpis ? kpis.avg_sales_cycle : 'Active pipeline',
      change: `${leadsList.length} total active prospects`,
      isPositive: true,
      icon: Calendar,
      bgColor: '#ffedd5',
      iconColor: '#ea580c'
    }
  ];

  // Derive Kanban board columns directly from real database leads collection (Single Source of Truth)
  const normalizedLeads = (leadsList || []).map(lead => ({
    ...lead,
    stage: (lead.stage || 'new').toLowerCase().replace(' ', '-')
  }));

  const getLeadsForStage = (stageKey) => {
    return normalizedLeads.filter(l => {
      const st = l.stage;
      if (stageKey === 'new') return st === 'new' || st === 'lead';
      if (stageKey === 'qualified') return st === 'qualified' || st === 'qualify';
      if (stageKey === 'proposal') return st === 'proposal';
      if (stageKey === 'negotiation') return st === 'negotiation';
      if (stageKey === 'closed-won') return st === 'closed-won' || st === 'won';
      return false;
    });
  };

  const newLeads = getLeadsForStage('new');
  const qualifiedLeads = getLeadsForStage('qualified');
  const proposalLeads = getLeadsForStage('proposal');
  const negotiationLeads = getLeadsForStage('negotiation');
  const closedWonLeads = getLeadsForStage('closed-won');

  const kanbanColumns = [
    { key: 'new', title: 'New Leads', count: newLeads.length, cards: newLeads, badgeBg: '#e2e8f0', badgeText: '#334155' },
    { key: 'qualified', title: 'Qualified', count: qualifiedLeads.length, cards: qualifiedLeads, badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
    { key: 'proposal', title: 'Proposal', count: proposalLeads.length, cards: proposalLeads, badgeBg: '#f3e8ff', badgeText: '#7c3aed' },
    { key: 'negotiation', title: 'Negotiation', count: negotiationLeads.length, cards: negotiationLeads, badgeBg: '#ffedd5', badgeText: '#c2410c' },
    { key: 'closed-won', title: 'Closed Won', count: closedWonLeads.length, cards: closedWonLeads, badgeBg: '#dcfce7', badgeText: '#15803d' }
  ];

  const displayRecs = recommendations;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: '0.84375rem',
          fontWeight: 600
        }}>
          <Sparkles size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching PDF Page 5 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            <Bookmark size={13} /> MILESTONE 4 • WEEKS 7-8
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Dashboard & Automation
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Sales analytics dashboard with automated follow-up recommendations
          </p>
        </div>

        <button 
          onClick={handleRefreshAI}
          disabled={isRefreshing}
          className="btn-light-secondary"
          style={{ padding: '0.5rem 0.875rem', fontSize: '0.78125rem', background: '#ffffff', borderColor: '#cbd5e1' }}
        >
          <RefreshCw size={14} className={isRefreshing ? "spin-icon" : ""} />
          {isRefreshing ? 'Refreshing AI...' : 'Refresh AI Analytics'}
        </button>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', width: '100%' }}>
        {metricCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="pdf-panel-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78125rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.title}
                </span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={19} color={card.iconColor} />
                </div>
              </div>

              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', lineHeight: '1.2', marginBottom: '0.5rem' }}>
                {card.value}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.change.startsWith('+') ? <ArrowUpRight size={14} className="shrink-0" /> : <ArrowDownRight size={14} className="shrink-0" />}
                {card.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Sales Pipeline Board + Follow-up Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.25rem', minHeight: '520px', width: '100%' }}>
        
        {/* Sales Pipeline Kanban Board */}
        <div className="pdf-panel-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Sales Pipeline</h3>
            <div style={{ display: 'flex', gap: '0.375rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
              {['This Month', 'This Quarter', 'This Year'].map(t => (
                <button
                  key={t}
                  onClick={() => setPipelineFilter(t)}
                  style={{
                    background: pipelineFilter === t ? '#ffffff' : 'transparent',
                    color: pipelineFilter === t ? '#0f172a' : '#64748b',
                    border: 'none',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: pipelineFilter === t ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: pipelineFilter === t ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(180px, 1fr))', gap: '0.75rem', flex: 1, overflowX: 'auto', paddingBottom: '4px' }}>
            {kanbanColumns.map((col, idx) => (
              <div key={idx} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                height: '490px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{col.title}</span>
                  <span style={{ fontSize: '0.6875rem', background: col.badgeBg, color: col.badgeText, padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 800 }}>
                    {col.count}
                  </span>
                </div>

                  <div 
                    className="custom-scrollbar" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.5rem', 
                      flex: 1, 
                      overflowY: 'auto', 
                      overflowX: 'hidden',
                      paddingRight: '4px',
                      boxSizing: 'border-box',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    }}
                  >
                    {col.cards.length > 0 ? (
                      col.cards.map((card) => (
                        <div key={card.id} style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.65rem 0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'none';
                        }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', lineHeight: '1.3' }}>
                              {card.company || card.company_name}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.71875rem', color: '#64748b' }}>
                            {card.contactName || 'No contact'}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px solid #f1f5f9', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, flexShrink: 0 }}>
                              {card.dealValue ? `$${Math.round(Number(card.dealValue) / 1000)}K` : '$0'}
                            </span>
                            {onUpdateLead && (
                              <select
                                value={card.stage || 'new'}
                                onChange={async (e) => {
                                  const newStage = e.target.value;
                                  await onUpdateLead({ ...card, stage: newStage });
                                }}
                                style={{
                                  fontSize: '0.6875rem',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '0.12rem 0.35rem',
                                  color: '#334155',
                                  fontWeight: 600,
                                  outline: 'none',
                                  cursor: 'pointer',
                                  width: 'auto',
                                  maxWidth: '140px',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <option value="new">Move: New Lead</option>
                                <option value="qualified">Move: Qualified</option>
                                <option value="proposal">Move: Proposal</option>
                                <option value="negotiation">Move: Negotiation</option>
                                <option value="closed-won">Move: Closed Won</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-stage" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '120px',
                        color: '#94a3b8',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        textAlign: 'center',
                        padding: '1rem 0.5rem'
                      }}>
                        No {col.title.toLowerCase()} yet
                      </div>
                    )}
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Follow-up Recommendations matching Page 5 PDF */}
        <div className="pdf-panel-card custom-scrollbar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '520px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexShrink: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Follow-up Recommendations</h3>
            <span className="badge-ai-purple">
              <Sparkles size={12} /> AI Powered
            </span>
          </div>

          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto', maxHeight: '440px', paddingRight: '6px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
            {displayRecs && displayRecs.length > 0 ? (
              displayRecs.map((rec, rIdx) => {
                const priorityStr = rec.priority_level || rec.priority || 'High Priority';
                let badgeBg = '#ffe4e6';
                let badgeText = '#e11d48';
                if (priorityStr.toLowerCase().includes('medium')) {
                  badgeBg = '#f3e8ff';
                  badgeText = '#7c3aed';
                } else if (priorityStr.toLowerCase().includes('low')) {
                  badgeBg = '#dbeafe';
                  badgeText = '#1d4ed8';
                }

                return (
                  <div 
                    key={rec.id || `rec-${rIdx}`}
                    onClick={onNavigateToConversations}
                    style={{ 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px', 
                      padding: '1rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s ease' 
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0f172a' }}>
                        {rec.title}
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                    
                    <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                      {rec.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        background: badgeBg, 
                        color: badgeText, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        fontWeight: 700 
                      }}>
                        {priorityStr}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                        {rec.time_ago || rec.timeAgo || 'Recently'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                No follow-up recommendations available yet. Add leads and run conversation analysis to generate recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
