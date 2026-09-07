import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

export default function EditLeadModal({ isOpen, onClose, leadToEdit, onSaveLead }) {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [revenue, setRevenue] = useState('');
  const [location, setLocation] = useState('');
  const [funding, setFunding] = useState('');
  const [dealValue, setDealValue] = useState(0);
  const [status, setStatus] = useState('new');
  const [techStackInput, setTechStackInput] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (isOpen && leadToEdit) {
      setCompany(leadToEdit.company || leadToEdit.company_name || '');
      setContactName(leadToEdit.contactName || '');
      setEmail(leadToEdit.email || '');
      setPhone(leadToEdit.phone || '');
      setIndustry(leadToEdit.industry || '');
      setSize(leadToEdit.size || '');
      setRevenue(leadToEdit.revenue || '');
      setLocation(leadToEdit.location || '');
      setFunding(leadToEdit.funding || '');
      setDealValue(leadToEdit.dealValue || leadToEdit.deal_value || 0);
      setStatus(leadToEdit.stage || leadToEdit.status || 'new');
      setTechStackInput(leadToEdit.techStack ? leadToEdit.techStack.join(', ') : '');
    }
  }, [isOpen, leadToEdit]);

  if (!isOpen) return null;

  const handleAiAutoFill = async () => {
    if (!company.trim()) return;
    setIsAutoFilling(true);
    try {
      const response = await fetch('http://localhost:8000/leads/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: company.trim() })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.company_size && data.company_size !== "Not available") setSize(data.company_size);
        if (data.funding_stage && data.funding_stage !== "Not available") setFunding(data.funding_stage);
        if (data.industry && data.industry !== "Unknown (AI analysis unavailable)") setIndustry(data.industry);
        if (data.tech_stack && data.tech_stack.length > 0) setTechStackInput(data.tech_stack.join(', '));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim()) return;

    const techArray = techStackInput.split(',').map(t => t.trim()).filter(Boolean);

    const updatedLead = {
      ...leadToEdit,
      company,
      contactName,
      email,
      phone,
      industry,
      size,
      revenue,
      location,
      funding,
      dealValue: Number(dealValue) || 0,
      stage: status,
      techStack: techArray
    };

    onSaveLead(updatedLead);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Edit lead
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={labelStyle}>COMPANY NAME *</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                required 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                style={{ ...inputStyle, flex: 1 }} 
              />
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAutoFilling || !company.trim()}
                style={{
                  background: '#eef2ff',
                  border: '1px solid #3b82f6',
                  color: '#3b82f6',
                  borderRadius: '6px',
                  padding: '0 1rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  cursor: (isAutoFilling || !company.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isAutoFilling || !company.trim()) ? 0.5 : 1
                }}
              >
                {isAutoFilling ? <Loader2 size={14} className="spin-animation" /> : <Sparkles size={14} />}
                Auto-fill
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>CONTACT NAME</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>PHONE</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>INDUSTRY</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>COMPANY SIZE</label>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ANNUAL REVENUE</label>
              <input type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>LOCATION</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>FUNDING STAGE</label>
              <input type="text" value={funding} onChange={(e) => setFunding(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>DEAL VALUE ($)</label>
              <input 
                type="number" 
                value={dealValue} 
                onChange={(e) => setDealValue(e.target.value)} 
                style={{ ...inputStyle, border: '2px solid #3b82f6', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={labelStyle}>STATUS</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>TECHNOLOGY STACK (COMMA-SEPARATED)</label>
            <input type="text" value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" style={{
              background: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#94a3b8',
  display: 'block',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '0.625rem 0.75rem',
  fontSize: '0.875rem',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box'
};
