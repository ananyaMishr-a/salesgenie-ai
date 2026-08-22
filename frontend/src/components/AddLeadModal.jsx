import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Building2, 
  Plus, 
  Loader2,
  Wand2
} from 'lucide-react';

const presetCompanies = [
  {
    company: 'Stripe Inc.',
    contactName: 'Patrick Collison',
    role: 'Co-Founder & CEO',
    tier: 'Enterprise',
    size: '5000+ employees',
    revenue: '$1B+',
    location: 'San Francisco, CA',
    funding: 'Public Evaluation • $50B',
    techStack: ['AWS', 'Ruby', 'React', 'Go', 'Kubernetes', 'Salesforce'],
    qualificationScore: 96,
    insights: [
      { type: 'High Growth Potential', detail: 'Market leader expanding AI payment intelligence stack.' },
      { type: 'Tech Alignment', detail: 'Native cloud platform ready for FastAPI endpoint connectors.' },
      { type: 'Decision Maker', detail: 'Executive leadership evaluating SDR workflow automation.' }
    ]
  },
  {
    company: 'Datadog',
    contactName: 'Olivier Pomel',
    role: 'CEO',
    tier: 'Enterprise',
    size: '4000+ employees',
    revenue: '$1.6B+',
    location: 'New York, NY',
    funding: 'Public (NASDAQ: DDOG)',
    techStack: ['GCP', 'Python', 'Go', 'React', 'Docker', 'HubSpot'],
    qualificationScore: 94,
    insights: [
      { type: 'High Tech Alignment', detail: 'Extensive monitoring infrastructure requiring real-time CRM webhooks.' },
      { type: 'Budget Availability', detail: 'High annual SaaS budget for sales operations optimization.' }
    ]
  },
  {
    company: 'Vercel Platform',
    contactName: 'Guillermo Rauch',
    role: 'CEO',
    tier: 'Mid-Market',
    size: '300-500 employees',
    revenue: '$100M - $250M',
    location: 'San Francisco, CA',
    funding: 'Series D • $150M',
    techStack: ['AWS', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    qualificationScore: 89,
    insights: [
      { type: 'Rapid Scale', detail: 'Scaling enterprise sales team from 30 to 120 SDRs.' },
      { type: 'Tech Compatibility', detail: 'Modern JavaScript/Python tech stack matches our APIs.' }
    ]
  }
];

export default function AddLeadModal({ isOpen, onClose, onAddLead }) {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('VP of Technology');
  const [tier, setTier] = useState('Enterprise');
  const [size, setSize] = useState('250-500 employees');
  const [revenue, setRevenue] = useState('$25M - $50M');
  const [location, setLocation] = useState('San Francisco, CA');
  const [funding, setFunding] = useState('Series B • $20M');
  const [techStackInput, setTechStackInput] = useState('AWS, React, Python, PostgreSQL, Salesforce');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCompany('');
      setContactName('');
      setRole('VP of Technology');
      setTier('Enterprise');
      setSize('250-500 employees');
      setRevenue('$25M - $50M');
      setLocation('San Francisco, CA');
      setFunding('Series B • $20M');
      setTechStackInput('AWS, React, Python, PostgreSQL, Salesforce');
      setIsAutoFilling(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setIsAutoFilling(true);
    setTimeout(() => {
      setCompany(preset.company);
      setContactName(preset.contactName);
      setRole(preset.role);
      setTier(preset.tier);
      setSize(preset.size);
      setRevenue(preset.revenue);
      setLocation(preset.location);
      setFunding(preset.funding);
      setTechStackInput(preset.techStack.join(', '));
      setIsAutoFilling(false);
    }, 400);
  };

  const handleAiAutoFill = () => {
    if (!company.trim()) {
      setCompany('Datadog');
    }
    setIsAutoFilling(true);
    setTimeout(() => {
      const selected = presetCompanies[Math.floor(Math.random() * presetCompanies.length)];
      setCompany(company.trim() ? company : selected.company);
      setContactName(contactName.trim() ? contactName : selected.contactName);
      setRole(role || selected.role);
      setTier(selected.tier);
      setSize(selected.size);
      setRevenue(selected.revenue);
      setLocation(selected.location);
      setFunding(selected.funding);
      setTechStackInput(selected.techStack.join(', '));
      setIsAutoFilling(false);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !contactName.trim()) return;

    const techArray = techStackInput.split(',').map(t => t.trim()).filter(Boolean);

    const newLead = {
      id: `p-${Date.now()}`,
      company,
      contactName,
      role,
      tier,
      timeAgo: 'Just now',
      size,
      revenue,
      location,
      funding,
      techStack: techArray.length > 0 ? techArray : ['AWS', 'React', 'Python', 'Salesforce'],
      qualificationScore: Math.floor(Math.random() * 15) + 84, // 84-98
      insights: [
        { type: 'AI Auto-Filled Analysis', detail: `${company} identified with strong growth indicators and budget allocation for AI tools.` },
        { type: 'Tech Stack Match', detail: `Compatible with ${techArray[0] || 'Salesforce'} bi-directional sync.` },
        { type: 'Decision Buyer', detail: `${contactName} (${role}) verified as key purchasing contact.` }
      ]
    };

    onAddLead(newLead);
    onClose();
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
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        padding: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.375rem', borderRadius: '8px', background: '#dbeafe', color: '#2563eb' }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                Add New Prospect & Run AI Intelligence
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Create prospect record or click AI Auto-Fill to fetch company parameters automatically.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* AI Autofill Presets Bar */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Wand2 size={14} /> AI Folder & Profile Auto-Fill Templates:
            </span>
            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAutoFilling}
              className="btn-light-secondary"
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.6875rem', color: '#0284c7', borderColor: '#7dd3fc' }}
            >
              {isAutoFilling ? <Loader2 size={12} className="spin-animation" /> : <Sparkles size={12} />}
              {isAutoFilling ? 'Analyzing...' : 'Auto-Fill Random'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {presetCompanies.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '0.35rem 0.625rem',
                  fontSize: '0.75rem',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Building2 size={12} /> {p.company}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Datadog"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Primary Contact Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Patrick Collison"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Market Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              >
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="Startup">Startup</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Company Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Annual Revenue
              </label>
              <input
                type="text"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Funding Stage
              </label>
              <input
                type="text"
                value={funding}
                onChange={(e) => setFunding(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. AWS, Python, React, PostgreSQL, Salesforce"
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-light-secondary" style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-blue-primary">
              <Plus size={16} /> Save Lead to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
