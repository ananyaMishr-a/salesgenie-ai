import React, { useState, useMemo } from 'react';
import { 
  Bookmark,
  MessageSquareText,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Send,
  Flame,
  Sun,
  Snowflake,
  Search
} from 'lucide-react';
import OutreachGeneratorView from './OutreachGeneratorView';

export default function OutreachModule({ prospectsList, onNavigateToConversations }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'generator'
  const [selectedProspect, setSelectedProspect] = useState(null);
  
  const [industryFilter, setIndustryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const industries = useMemo(() => {
    const list = ['All'];
    if (prospectsList && Array.isArray(prospectsList)) {
      prospectsList.forEach(p => {
        if (p?.industry && !list.includes(p.industry)) {
          list.push(p.industry);
        }
      });
    }
    return list;
  }, [prospectsList]);

  const filteredAndSortedProspects = useMemo(() => {
    let list = [...(prospectsList || [])];
    
    // Industry Filter
    if (industryFilter !== 'All') {
      list = list.filter(p => p?.industry === industryFilter);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => {
        const companyMatch = p?.company ? p.company.toLowerCase().includes(q) : false;
        const contactMatch = p?.contactName ? p.contactName.toLowerCase().includes(q) : false;
        const industryMatch = p?.industry ? p.industry.toLowerCase().includes(q) : false;
        return companyMatch || contactMatch || industryMatch;
      });
    }

    // Sort Order
    list.sort((a, b) => {
      const scoreA = a?.qualificationScore || 0;
      const scoreB = b?.qualificationScore || 0;
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

    return list;
  }, [prospectsList, industryFilter, searchQuery, sortOrder]);

  const handleOpenGenerator = (prospect) => {
    setSelectedProspect(prospect);
    setView('generator');
  };

  // Render the generator view if active
  if (view === 'generator') {
    return (
      <OutreachGeneratorView 
        prospect={selectedProspect} 
        onBack={() => setView('dashboard')} 
      />
    );
  }

  // Otherwise, render Dashboard View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Milestone 2 Header matching PDF Page 4 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            <Bookmark size={13} /> MILESTONE 2 • WEEKS 3-4
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Outreach Generation & Lead Scoring
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Personalized email creation and AI-powered lead qualification
          </p>
        </div>

        <button onClick={onNavigateToConversations} className="btn-light-secondary">
          <MessageSquareText size={14} color="#7c3aed" /> View Call Summaries
        </button>
      </div>

      {/* Lead Scoring Dashboard Table */}
      <div className="pdf-panel-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Blue Header Bar */}
        <div style={{ 
          background: '#4f46e5',
          padding: '0.875rem 1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Lead Scoring Dashboard</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input in Table Header */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem 0.25rem 1.75rem',
                  fontSize: '0.75rem',
                  color: '#ffffff',
                  outline: 'none',
                  width: '150px'
                }}
              />
            </div>

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              <Filter size={13} />
              <select 
                value={industryFilter} 
                onChange={(e) => setIndustryFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind} style={{ color: '#000' }}>{ind}</option>
                ))}
              </select>
            </div>
            
            {/* Sort Button */}
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              style={{ 
                background: 'rgba(255,255,255,0.15)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                color: '#ffffff', 
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.375rem', 
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {sortOrder === 'desc' ? <ArrowDownWideNarrow size={14} /> : <ArrowUpWideNarrow size={14} />} 
              Sort Score
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="custom-scrollbar" style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', maxHeight: '520px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', width: '25%' }}>Lead</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', width: '35%' }}>Company & Contact</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', width: '20%' }}>Score</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', width: '20%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProspects.map((prospect, idx) => {
                const score = prospect?.qualificationScore || 0;
                const isHot = score >= 75;
                const isWarm = score >= 50;

                let badgeLabel = 'Cold';
                let badgeBg = '#dbeafe';
                let badgeColor = '#1d4ed8';

                if (isHot) {
                  badgeLabel = 'Hot';
                  badgeBg = '#fee2e2';
                  badgeColor = '#dc2626';
                } else if (isWarm) {
                  badgeLabel = 'Warm';
                  badgeBg = '#fef9c3';
                  badgeColor = '#a16207';
                }

                const contactFirstName = prospect?.contactName ? prospect.contactName.split(' ')[0].toLowerCase() : 'lead';
                const companySlug = prospect?.company ? prospect.company.replace(/\s+/g, '').toLowerCase() : 'company';

                return (
                  <tr key={prospect?.id || idx} style={{ borderBottom: idx !== filteredAndSortedProspects.length - 1 ? '1px solid #e2e8f0' : 'none', background: '#ffffff', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = '#ffffff'}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{prospect?.company || 'Company'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prospect?.industry || 'Technology'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{prospect?.contactName || 'Contact'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{contactFirstName}@{companySlug}.com</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: badgeBg,
                        color: badgeColor,
                        padding: '0.25rem 0.625rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {isHot ? <Flame size={12} fill="currentColor" /> : isWarm ? <Sun size={12} fill="currentColor" /> : <Snowflake size={12} />}
                        {badgeLabel} ({score})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleOpenGenerator(prospect)}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '0.375rem 0.875rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Send size={13} />
                        Generate Outreach
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Fallback empty state */}
              {filteredAndSortedProspects.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No prospects match the selected filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
