import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2
} from 'lucide-react';

export default function EditLeadModal({ isOpen, onClose, leadToEdit, onSaveLead }) {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [tier, setTier] = useState('');
  const [size, setSize] = useState('');
  const [revenue, setRevenue] = useState('');
  const [location, setLocation] = useState('');
  const [funding, setFunding] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  useEffect(() => {
    if (isOpen && leadToEdit) {
      setCompany(leadToEdit.company || '');
      setContactName(leadToEdit.contactName || '');
      setRole(leadToEdit.role || '');
      setTier(leadToEdit.tier || '');
      setSize(leadToEdit.size || '');
      setRevenue(leadToEdit.revenue || '');
      setLocation(leadToEdit.location || '');
      setFunding(leadToEdit.funding || '');
      setTechStackInput(leadToEdit.techStack ? leadToEdit.techStack.join(', ') : '');
    }
  }, [isOpen, leadToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !contactName.trim()) return;

    const techArray = techStackInput.split(',').map(t => t.trim()).filter(Boolean);

    const updatedLead = {
      ...leadToEdit,
      company,
      contactName,
      role,
      tier,
      size,
      revenue,
      location,
      funding,
      techStack: techArray
    };

    onSaveLead(updatedLead);
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
                Edit Lead Profile
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Update contact and company details manually.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Company Name *</label>
              <input type="text" required value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Market Tier</label>
              <select value={tier} onChange={e => setTier(e.target.value)} style={inputStyle}>
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="Startup">Startup</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Contact Name *</label>
              <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Role/Title</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Company Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Annual Revenue</label>
              <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Funding Stage</label>
              <input type="text" value={funding} onChange={e => setFunding(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Tech Stack (comma separated)</label>
            <input type="text" value={techStackInput} onChange={e => setTechStackInput(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{
              background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" className="btn-blue-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: '#0f172a',
  outline: 'none'
};
