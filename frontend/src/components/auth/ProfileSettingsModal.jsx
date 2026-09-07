import React, { useState } from 'react';
import { X, User, Lock, AlertTriangle, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { updateProfileRequest, updatePasswordRequest, deleteAccountRequest, requestDeleteOtpRequest } from '../../api/authApi';

export default function ProfileSettingsModal({ isOpen, onClose, user, onUpdateUser, onAccountDeleted }) {
  const [activeTab, setActiveTab] = useState('general');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Multi-Step State
  const [deleteStep, setDeleteStep] = useState(0); // 0: init, 1: reason, 2: credentials, 3: otp
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    
    try {
      const res = await updateProfileRequest({ name });
      setProfileSuccess(res.message);
      if (onUpdateUser) onUpdateUser({ ...user, name: res.name });
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await updatePasswordRequest({ old_password: oldPassword, new_password: newPassword });
      setPasswordSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestDeleteOtp = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await requestDeleteOtpRequest({ email: deleteEmail, password: deletePassword });
      setDeleteStep(3);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await deleteAccountRequest({
        email: deleteEmail,
        password: deletePassword,
        otp_code: deleteOtp,
        reason: deleteReason
      });
      if (onAccountDeleted) onAccountDeleted();
    } catch (err) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '550px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Profile Settings</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Manage your account and preferences</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <div style={{ width: '160px', borderRight: '1px solid #f1f5f9', background: '#ffffff', padding: '1rem 0' }}>
            <button
              onClick={() => setActiveTab('general')}
              style={{
                width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none',
                background: activeTab === 'general' ? '#f0f9ff' : 'transparent',
                color: activeTab === 'general' ? '#0369a1' : '#475569',
                borderRight: activeTab === 'general' ? '3px solid #0ea5e9' : '3px solid transparent',
                fontWeight: activeTab === 'general' ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem'
              }}
            >
              <User size={16} /> General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none',
                background: activeTab === 'security' ? '#f0f9ff' : 'transparent',
                color: activeTab === 'security' ? '#0369a1' : '#475569',
                borderRight: activeTab === 'security' ? '3px solid #0ea5e9' : '3px solid transparent',
                fontWeight: activeTab === 'security' ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem'
              }}
            >
              <Lock size={16} /> Security
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              style={{
                width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none',
                background: activeTab === 'danger' ? '#fef2f2' : 'transparent',
                color: activeTab === 'danger' ? '#dc2626' : '#ef4444',
                borderRight: activeTab === 'danger' ? '3px solid #ef4444' : '3px solid transparent',
                fontWeight: activeTab === 'danger' ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', marginTop: '1rem'
              }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '1.5rem', background: '#ffffff', overflowY: 'auto' }}>
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <form onSubmit={handleUpdateProfile}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Personal Information</h3>
                
                {profileSuccess && (
                  <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle2 size={16} /> {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    {profileError}
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontSize: '0.875rem' }} 
                  />
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                </div>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="submit" disabled={profileLoading} className="btn-blue-primary" style={{ padding: '0.5rem 1.25rem', opacity: profileLoading ? 0.7 : 1 }}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Change Password</h3>
                
                {passwordSuccess && (
                  <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle2 size={16} /> {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    {passwordError}
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Current Password</label>
                  <input 
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} 
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} 
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Confirm New Password</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="submit" disabled={passwordLoading} className="btn-blue-primary" style={{ padding: '0.5rem 1.25rem', opacity: passwordLoading ? 0.7 : 1 }}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={20} /> Delete Account
                </h3>
                
                {deleteError && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    {deleteError}
                  </div>
                )}

                {deleteStep === 0 && (
                  <>
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0, fontWeight: 600 }}>Warning: This action is permanent and cannot be undone.</p>
                      <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
                        Deleting your account will permanently erase all your leads, conversations, CRM sync logs, and AI insights from our servers. 
                      </p>
                    </div>
                    <button 
                      onClick={() => setDeleteStep(1)}
                      style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete Account
                    </button>
                  </>
                )}

                {deleteStep === 1 && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', fontWeight: 500 }}>
                      We're sorry to see you go! Why are you deleting your account?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {['Too expensive', 'Missing features', 'Just testing', 'Found a better alternative', 'Other'].map(reason => (
                        <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="deleteReason" value={reason} onChange={(e) => setDeleteReason(e.target.value)} checked={deleteReason === reason} />
                          {reason}
                        </label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setDeleteStep(0)} style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button onClick={() => setDeleteStep(2)} disabled={!deleteReason} style={{ padding: '0.5rem 1.25rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: deleteReason ? 'pointer' : 'not-allowed', fontWeight: 600, opacity: deleteReason ? 1 : 0.6 }}>Next</button>
                    </div>
                  </>
                )}

                {deleteStep === 2 && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', fontWeight: 500 }}>
                      For security, please enter your credentials to request an authorization code.
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Email</label>
                      <input type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder="name@company.com" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>Password</label>
                      <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setDeleteStep(1)} style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Back</button>
                      <button onClick={handleRequestDeleteOtp} disabled={!deleteEmail || !deletePassword || deleteLoading} style={{ padding: '0.5rem 1.25rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        {deleteLoading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </>
                )}

                {deleteStep === 3 && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', fontWeight: 500 }}>
                      We have sent a 6-digit authorization code to your email. Enter it below to permanently delete your account.
                    </p>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>6-Digit OTP Code</label>
                      <input type="text" value={deleteOtp} onChange={(e) => setDeleteOtp(e.target.value)} placeholder="000000" maxLength={6} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.25rem', letterSpacing: '8px', textAlign: 'center' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setDeleteStep(2)} style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Back</button>
                      <button onClick={handleDeleteAccount} disabled={deleteOtp.length !== 6 || deleteLoading} style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
