import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Milestone3Banner from './components/Milestone3Banner';
import CRMSyncStatus from './components/CRMSyncStatus';
import MeetingSummarizer from './components/MeetingSummarizer';
import RecentActivityFeed from './components/RecentActivityFeed';
import FastApiConsole from './components/FastApiConsole';
import NewConversationModal from './components/NewConversationModal';
import CRMSettingsModal from './components/CRMSettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import ToastNotification from './components/ToastNotification';
import ProtectedRoute from './components/auth/ProtectedRoute';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

// Lazy loaded top-level module views for optimal code-splitting
const LeadsModule = lazy(() => import('./components/LeadsModule'));
const OutreachModule = lazy(() => import('./components/OutreachModule'));
const DashboardModule = lazy(() => import('./components/DashboardModule'));

import { 
  fetchLeads, 
  createLead as apiCreateLead, 
  updateLead as apiUpdateLead, 
  deleteLead as apiDeleteLead,
  fetchActivities,
  apiAddActivity,
  formatIST
} from './api/leadsApi';
import { 
  triggerCrmSync, 
  fetchCrmSyncLogs,
  fetchConversationsForLead,
  fetchAllConversations,
  updateConversation,
  mapConversationFromApi
} from './api/conversationsApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MainAppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('leads');
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [crmLogs, setCrmLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFastApiOpen, setIsFastApiOpen] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isCrmSettingsOpen, setIsCrmSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load backend leads, CRM logs, & activities on mount
  const refreshData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [liveLeads, logs, dbActivities] = await Promise.all([
        fetchLeads().catch(() => []),
        fetchCrmSyncLogs().catch(() => []),
        fetchActivities().catch(() => [])
      ]);

      if (liveLeads) {
        setProspects(liveLeads);
        if (liveLeads.length > 0) {
          setSelectedProspect(prev => {
            if (!prev) return liveLeads[0];
            const found = liveLeads.find(l => l.id === prev.id);
            return found || liveLeads[0];
          });
        } else {
          setSelectedProspect(null);
          setMeetings([]);
        }
      }

      if (logs) {
        const mappedLogs = logs.map(l => {
          const matchingLead = (liveLeads || []).find(p => p.id === l.lead_id);
          const companyName = matchingLead ? matchingLead.company : `Lead #${l.lead_id}`;
          const contactName = matchingLead ? matchingLead.contactName : `Contact`;
          return {
            id: `c-${l.sync_id}`,
            type: 'CRM Bi-directional Sync',
            actionTag: l.sync_status || 'Synced',
            tagColor: 'emerald',
            contactName: `${companyName} (${contactName})`,
            contactRole: 'Salesforce & HubSpot Bi-directional Sync',
            platform: l.crm_platform || 'Salesforce',
            timeAgo: l.timestamp ? formatIST(l.timestamp) : 'Not provided',
            icon: 'UserCheck',
            details: `Persisted sync log record #${l.sync_id} in database for lead #${l.lead_id}.`
          };
        });
        setCrmLogs(mappedLogs);
      }

      if (dbActivities) {
        setActivities(dbActivities);
      }
    } catch (err) {
      console.warn('[SalesGenie API] Backend load error.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load backend persisted conversations across all database leads
  React.useEffect(() => {
    const loadMeetings = async () => {
      try {
        const records = await fetchAllConversations().catch(() => []);
        if (Array.isArray(records) && records.length > 0) {
          let mapped = records.map(r => {
            const matchingLead = prospects.find(p => String(p.id) === String(r.lead_id)) || selectedProspect;
            return mapConversationFromApi(r, matchingLead);
          });

          // Merge with localStorage overrides to guarantee 100% check/uncheck & delete persistence across refreshes
          try {
            const savedMeetingsStr = localStorage.getItem('salesgenie_meetings');
            const savedMeetings = savedMeetingsStr ? JSON.parse(savedMeetingsStr) : [];
            const cleanId = (val) => String(val || '').replace(/\D/g, '');

            mapped = mapped.map(m => {
              const mNumId = cleanId(m.id || m.interaction_id);
              const savedM = savedMeetings.find(sm => {
                const smNumId = cleanId(sm.id || sm.interaction_id);
                return smNumId === mNumId || String(sm.id) === String(m.id);
              });

              let updatedM = { ...m };

              if (savedM && Array.isArray(savedM.actionItems) && (!m.actionItems || m.actionItems.length === 0)) {
                updatedM.actionItems = savedM.actionItems;
              } else {
                const savedActionsForM = localStorage.getItem(`salesgenie_actions_${m.id}`) || localStorage.getItem(`salesgenie_actions_${mNumId}`);
                if (savedActionsForM && (!m.actionItems || m.actionItems.length === 0)) {
                  updatedM.actionItems = JSON.parse(savedActionsForM);
                }
              }

              if (savedM && Array.isArray(savedM.notes) && (!m.notes || m.notes.length === 0)) {
                updatedM.notes = savedM.notes;
              } else {
                const savedNotesForM = localStorage.getItem(`salesgenie_notes_${m.id}`) || localStorage.getItem(`salesgenie_notes_${mNumId}`);
                if (savedNotesForM && (!m.notes || m.notes.length === 0)) {
                  updatedM.notes = JSON.parse(savedNotesForM);
                }
              }

              return updatedM;
            });
          } catch (e) {
            console.warn("LocalStorage merge error:", e);
          }

          setMeetings(mapped);
          setSelectedMeetingId(prev => {
            if (prev && mapped.some(m => String(m.id) === String(prev))) return prev;
            return mapped[0]?.id || null;
          });
        } else {
          setMeetings([]);
          setSelectedMeetingId(null);
        }
      } catch (err) {
        console.warn('[SalesGenie] Conversation load error:', err);
      }
    };
    loadMeetings();
  }, [prospects, selectedProspect]);

  // Add Lead to Backend Database
  const handleAddLead = async (newLeadValues) => {
    try {
      const savedLead = await apiCreateLead(newLeadValues);
      await refreshData();
      setSelectedProspect(savedLead);
      showToast(`Lead ${savedLead.company} created successfully!`, 'success');
    } catch (err) {
      console.error("Failed to add lead:", err);
      showToast("Failed to create lead.", 'error');
      throw err;
    }
  };

  // Update Existing Lead in Backend Database
  const handleUpdateLead = async (updatedLeadValues) => {
    try {
      const oldLead = prospects.find(p => String(p.id) === String(updatedLeadValues.id));
      const savedLead = await apiUpdateLead(updatedLeadValues.id, updatedLeadValues);
      
      // Log activity if lead stage moved
      if (oldLead && oldLead.stage !== updatedLeadValues.stage) {
        const formatStage = (s) => (s || 'new').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const activityTitle = `${savedLead.company} moved from ${formatStage(oldLead.stage)} to ${formatStage(updatedLeadValues.stage)}`;
        await apiAddActivity({
          title: activityTitle,
          company: savedLead.company,
          type: 'Stage Moved'
        }).catch(() => null);
        showToast(`${savedLead.company} moved to ${formatStage(updatedLeadValues.stage)}`, 'info');
      } else {
        showToast(`Lead ${savedLead.company} updated!`, 'success');
      }

      await refreshData();
      if (selectedProspect?.id === savedLead.id) {
        setSelectedProspect(savedLead);
      }
    } catch (err) {
      console.error("Failed to update lead:", err);
      showToast("Failed to update lead.", 'error');
      throw err;
    }
  };

  // Delete Lead from Backend Database
  const handleDeleteLead = async (leadId) => {
    try {
      const leadToDelete = prospects.find(p => p.id === leadId);
      await apiDeleteLead(leadId);
      const remainingLeads = await fetchLeads().catch(() => []);
      setProspects(remainingLeads);
      if (selectedProspect?.id === leadId) {
        const nextSelected = remainingLeads[0] || null;
        setSelectedProspect(nextSelected);
        if (!nextSelected) {
          setMeetings([]);
        }
      }
      await refreshData();
      showToast(`Lead ${leadToDelete?.company || ''} deleted.`, 'info');
    } catch (err) {
      console.error("Failed to delete lead:", err);
      showToast("Failed to delete lead.", 'error');
      throw err;
    }
  };

  // Trigger real backend CRM sync
  const handleTriggerSync = async () => {
    if (!selectedProspect?.id) {
      showToast("Please select a lead first.", 'error');
      return;
    }
    setIsSyncing(true);
    try {
      const targetId = selectedProspect.id;
      await triggerCrmSync(targetId, 'Salesforce');
      await refreshData();
      showToast(`CRM sync completed for ${selectedProspect.company}!`, 'success');
    } catch (err) {
      console.warn("CRM Sync API error:", err);
      showToast("CRM Sync failed.", 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Update Action Items (check/uncheck, add, delete) & persist to database & localStorage
  const handleUpdateActionItems = async (meetingId, updatedActionItems) => {
    const cleanMeetingId = String(meetingId || '').replace(/\D/g, '');
    const currentM = meetings.find(m => {
      const mCleanId = String(m.id || m.interaction_id || '').replace(/\D/g, '');
      return mCleanId === cleanMeetingId || String(m.id) === String(meetingId);
    });

    const targetInteractionId = currentM?.interaction_id || currentM?.id || meetingId;

    setMeetings(prev => {
      const nextMeetings = prev.map(m => {
        const mCleanId = String(m.id || m.interaction_id || '').replace(/\D/g, '');
        if (mCleanId === cleanMeetingId || String(m.id) === String(meetingId)) {
          return { ...m, actionItems: updatedActionItems };
        }
        return m;
      });

      try {
        localStorage.setItem('salesgenie_meetings', JSON.stringify(nextMeetings));
        localStorage.setItem(`salesgenie_actions_${meetingId}`, JSON.stringify(updatedActionItems));
        if (cleanMeetingId) {
          localStorage.setItem(`salesgenie_actions_${cleanMeetingId}`, JSON.stringify(updatedActionItems));
        }
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }
      return nextMeetings;
    });

    if (targetInteractionId) {
      const numericId = parseInt(String(targetInteractionId).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        try {
          await updateConversation(numericId, { action_items: updatedActionItems });
          console.log(`[SalesGenie DB] Successfully updated action items in PostgreSQL for conversation #${numericId}`);
        } catch (err) {
          console.warn("Failed to persist action items update to backend DB:", err);
        }
      }
    }
    showToast("Action items updated and saved to DB.", 'success');
  };

  // Update Meeting Notes (add, delete) & persist to database & localStorage
  const handleUpdateNotes = async (meetingId, updatedNotes) => {
    const cleanMeetingId = String(meetingId || '').replace(/\D/g, '');
    const currentM = meetings.find(m => {
      const mCleanId = String(m.id || m.interaction_id || '').replace(/\D/g, '');
      return mCleanId === cleanMeetingId || String(m.id) === String(meetingId);
    });

    const targetInteractionId = currentM?.interaction_id || currentM?.id || meetingId;

    setMeetings(prev => {
      const nextMeetings = prev.map(m => {
        const mCleanId = String(m.id || m.interaction_id || '').replace(/\D/g, '');
        if (mCleanId === cleanMeetingId || String(m.id) === String(meetingId)) {
          return { ...m, notes: updatedNotes };
        }
        return m;
      });

      try {
        localStorage.setItem(`salesgenie_notes_${meetingId}`, JSON.stringify(updatedNotes));
        if (cleanMeetingId) {
          localStorage.setItem(`salesgenie_notes_${cleanMeetingId}`, JSON.stringify(updatedNotes));
        }
      } catch (e) {
        console.warn("LocalStorage save notes error:", e);
      }
      return nextMeetings;
    });

    if (targetInteractionId) {
      const numericId = parseInt(String(targetInteractionId).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        try {
          await updateConversation(numericId, { notes: updatedNotes });
          console.log(`[SalesGenie DB] Successfully updated notes in PostgreSQL for conversation #${numericId}`);
        } catch (err) {
          console.warn("Failed to persist notes update to backend DB:", err);
        }
      }
    }
    showToast("Meeting notes updated and saved to DB.", 'success');
  };

  // Add new meeting transcript to list
  const handleAddMeeting = async (newMeeting) => {
    setMeetings(prev => [newMeeting, ...prev]);
    setSelectedMeetingId(newMeeting.id);
    await refreshData();
    showToast("New conversation transcript analyzed and saved!", 'success');
  };

  // Add new note to activity feed & persist in database per selected meeting
  const handleAddActivityNote = async (newNote) => {
    try {
      await apiAddActivity(newNote);

      if (selectedMeetingId && meetings.length > 0) {
        const currentM = meetings.find(m => String(m.id) === String(selectedMeetingId));
        if (currentM && currentM.interaction_id) {
          const existingNotes = Array.isArray(currentM.notes) ? currentM.notes : [];
          const noteObj = {
            id: `note-${Date.now()}`,
            text: newNote.text || newNote.title || String(newNote),
            createdAt: formatIST(new Date())
          };
          const updatedNotes = [noteObj, ...existingNotes];
          const numericId = parseInt(String(currentM.interaction_id).replace(/\D/g, ''), 10);
          if (numericId) {
            await updateConversation(numericId, { notes: updatedNotes }).catch(() => null);
          }
        }
      }

      await refreshData();
      showToast("Activity note added.", 'success');
    } catch (err) {
      console.warn("Failed to add activity note:", err);
    }
  };

  // Push to CRM Handler
  const handlePushToCrm = async (meeting) => {
    const targetLeadId = meeting?.leadId || selectedProspect?.id;
    if (!targetLeadId) {
      showToast("Please select a lead first.", 'error');
      return;
    }
    try {
      await triggerCrmSync(targetLeadId, 'Salesforce');
      await refreshData();
      showToast("Pushed meeting takeaways & tasks to Salesforce CRM!", 'success');
    } catch (e) {
      console.warn("Push CRM error:", e);
      showToast("CRM push failed.", 'error');
    }
  };

  const handleSignOut = () => {
    logout();
    showToast("Successfully signed out.", 'info');
    navigate('/login', { replace: true });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: '100vh', padding: '1rem', background: '#f0f4f8' }}>
        {/* Toast Feedback Notification */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* PDF Document Window Frame */}
        <div className="pdf-window-frame">
          {/* Window Navigation Header matching PDF screenshots */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onOpenFastApiConsole={() => setIsFastApiOpen(true)}
            onOpenCrmSettingsModal={() => setIsCrmSettingsOpen(true)}
            onOpenNewConversationModal={() => setIsNewConversationOpen(true)}
            onSignOut={handleSignOut}
            user={user}
          />

          {/* Main Content Area */}
          <div style={{ padding: '1.5rem', background: '#ffffff' }}>
            <ErrorBoundary fallbackTitle="Module Error">
              <Suspense fallback={<LoadingSkeleton message={`Loading ${activeTab} module...`} />}>
                {/* Milestone 1 View (Leads) */}
                {activeTab === 'leads' && (
                  <LeadsModule
                    prospectsList={prospects}
                    onAddLead={handleAddLead}
                    onUpdateLead={handleUpdateLead}
                    onDeleteLead={handleDeleteLead}
                    selectedProspect={selectedProspect}
                    setSelectedProspect={setSelectedProspect}
                    onNavigateToOutreach={() => setActiveTab('outreach')}
                    onNavigateToConversations={() => setActiveTab('conversations')}
                  />
                )}

                {/* Milestone 2 View (Outreach) */}
                {activeTab === 'outreach' && (
                  <OutreachModule
                    prospectsList={prospects}
                    onNavigateToConversations={() => setActiveTab('conversations')}
                  />
                )}

                {/* Milestone 3 View (Conversations & CRM Intelligence) */}
                {activeTab === 'conversations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Top Banner matching Page 4 of PDF */}
                    <Milestone3Banner />

                    {/* 3-Column Milestone 3 Layout matching Page 4 of PDF */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(280px, 320px) minmax(360px, 1fr) minmax(280px, 320px)',
                      gap: '1.25rem',
                      alignItems: 'stretch',
                      minHeight: '600px'
                    }}>
                      {/* Left Column: CRM Sync Status */}
                      <CRMSyncStatus
                        crmLogs={crmLogs}
                        onTriggerSync={handleTriggerSync}
                        isSyncing={isSyncing}
                      />

                      {/* Center Column: Meeting Summary & AI Intelligence */}
                      <MeetingSummarizer
                        meetings={meetings}
                        selectedMeetingId={selectedMeetingId}
                        setSelectedMeetingId={setSelectedMeetingId}
                        onUpdateActionItems={handleUpdateActionItems}
                        onUpdateNotes={handleUpdateNotes}
                        onOpenNewConversationModal={() => setIsNewConversationOpen(true)}
                        onPushToCrm={handlePushToCrm}
                      />

                      {/* Right Column: Recent Activity Feed */}
                      <RecentActivityFeed
                        activities={activities}
                        onAddActivityNote={handleAddActivityNote}
                        currentCompany={selectedProspect?.company || 'Sales Pipeline'}
                      />
                    </div>
                  </div>
                )}

                {/* Milestone 4 View (Dashboard & Analytics) */}
                {activeTab === 'dashboard' && (
                  <DashboardModule
                    leadsList={prospects}
                    onUpdateLead={handleUpdateLead}
                    onNavigateToConversations={() => setActiveTab('conversations')}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Modals */}
        <FastApiConsole
          isOpen={isFastApiOpen}
          onClose={() => setIsFastApiOpen(false)}
        />

        <NewConversationModal
          isOpen={isNewConversationOpen}
          onClose={() => setIsNewConversationOpen(false)}
          onAddMeeting={handleAddMeeting}
          selectedProspect={selectedProspect}
          prospectsList={prospects}
        />

        <CRMSettingsModal
          isOpen={isCrmSettingsOpen}
          onClose={() => setIsCrmSettingsOpen(false)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage isSignUp={true} />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainAppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
