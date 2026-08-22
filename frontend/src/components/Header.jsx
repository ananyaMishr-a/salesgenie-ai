import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Code2, 
  SlidersHorizontal,
  Plus,
  User,
  ChevronDown,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onTriggerSync, 
  isSyncing, 
  onOpenFastApiConsole,
  onOpenCrmSettingsModal,
  onOpenNewConversationModal,
  onSignOut,
  user
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const userName = user?.name || user?.email?.split('@')[0] || 'Annu';
  const userEmail = user?.email || 'annu@salesgenie.ai';

  return (
    <>
      <div style={{
        borderBottom: '1px solid var(--border-light)',
        background: '#ffffff',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Top Left: macOS Dots + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* macOS Window Control Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
          </div>

          {/* Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              SalesGenie AI
            </span>
          </div>
        </div>

        {/* Center: Tabs matching PDF mockup (`Leads`, `Outreach`, `Conversations`, `Dashboard`) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--bg-tab-bar)',
          padding: '0.25rem',
          borderRadius: '10px'
        }}>
          {[
            { id: 'leads', label: 'Leads' },
            { id: 'outreach', label: 'Outreach' },
            { id: 'conversations', label: 'Conversations' },
            { id: 'dashboard', label: 'Dashboard' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  border: 'none',
                  padding: '0.4rem 1.125rem',
                  borderRadius: '7px',
                  fontSize: '0.84375rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button 
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="btn-light-secondary"
          >
            <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            {isSyncing ? 'Syncing...' : 'Sync CRM'}
          </button>

          <button 
            onClick={onOpenNewConversationModal}
            className="btn-blue-primary"
          >
            <Plus size={15} />
            New Meeting
          </button>

          <button 
            onClick={onOpenCrmSettingsModal}
            className="btn-light-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            title="CRM Integration Settings"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* User Profile / Avatar Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                padding: '0.35rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0369a1',
                cursor: 'pointer'
              }}
              title="User Profile & Settings"
            >
              <User size={15} color="#0284c7" />
              <span>{userName}</span>
              <ChevronDown size={13} color="#0369a1" />
            </button>

            {isProfileOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                background: '#ffffff',
                border: '1px solid #d1fae5',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(6, 78, 59, 0.12)',
                padding: '0.5rem',
                minWidth: '170px',
                zIndex: 1000
              }}>
                <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f0fdf4', marginBottom: '0.375rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>👤 {userName}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{userEmail}</div>
                </div>

                <div style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={13} color="#059669" /> Role: Account Admin
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.375rem', marginTop: '0.375rem' }}>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowSignOutConfirm(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '380px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Sign Out of SalesGenie AI?
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Are you sure you want to sign out? Your persistent CRM data, leads, meetings, and activity logs will be safely preserved.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="btn-light-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  if (onSignOut) onSignOut();
                }}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
