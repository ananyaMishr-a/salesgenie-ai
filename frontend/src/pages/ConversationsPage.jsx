import React, { useState, useEffect } from 'react';
import Milestone3Banner from '../components/Milestone3Banner.jsx';
import CRMSyncStatus from '../components/CRMSyncStatus.jsx';
import MeetingSummarizer from '../components/MeetingSummarizer.jsx';
import RecentActivityFeed from '../components/RecentActivityFeed.jsx';
import NewConversationModal from '../components/NewConversationModal.jsx';
import { triggerCrmSync, fetchCrmSyncLogs, fetchConversationsForLead, fetchAllConversations, updateConversation, mapConversationFromApi } from '../api/conversationsApi.js';
import { fetchActivities, apiAddActivity, formatIST } from '../api/leadsApi.js';

export default function ConversationsPage({ selectedProspect, prospectsList = [] }) {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [crmLogs, setCrmLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddActivityNote = async (note) => {
    try {
      await apiAddActivity(note);

      if (selectedMeetingId && meetings.length > 0) {
        const currentM = meetings.find(m => String(m.id) === String(selectedMeetingId));
        if (currentM && currentM.interaction_id) {
          const existingNotes = Array.isArray(currentM.notes) ? currentM.notes : [];
          const noteObj = {
            id: `note-${Date.now()}`,
            text: note.text || note.title || String(note),
            createdAt: formatIST(new Date())
          };
          const updatedNotes = [noteObj, ...existingNotes];
          const numericId = Number(String(currentM.interaction_id).replace('m-', ''));
          await updateConversation(numericId, { notes: updatedNotes }).catch(() => null);
        }
      }

      await loadData();
    } catch (err) {
      console.warn("Failed to add activity note:", err);
    }
  };

  const loadData = async () => {
    try {
      const [logs, dbActivities, allConvs] = await Promise.all([
        fetchCrmSyncLogs().catch(() => []),
        fetchActivities().catch(() => []),
        fetchAllConversations().catch(() => [])
      ]);

      if (logs) {
        const mappedLogs = logs.map(l => {
          const matchingLead = prospectsList.find(p => p.id === l.lead_id);
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

      if (Array.isArray(allConvs) && allConvs.length > 0) {
        let mappedConvs = allConvs.map(c => {
          const matchingLead = prospectsList.find(p => p.id === c.lead_id) || selectedProspect;
          return mapConversationFromApi(c, matchingLead);
        });

        // Merge with local storage state to guarantee 100% check/uncheck persistence across refreshes
        try {
          const savedMeetingsStr = localStorage.getItem('salesgenie_meetings');
          const savedMeetings = savedMeetingsStr ? JSON.parse(savedMeetingsStr) : [];
          
          const cleanId = (val) => String(val || '').replace(/\D/g, '');

          mappedConvs = mappedConvs.map(m => {
            const mNumId = cleanId(m.id || m.interaction_id);
            const savedM = savedMeetings.find(sm => {
              const smNumId = cleanId(sm.id || sm.interaction_id);
              return smNumId === mNumId || String(sm.id) === String(m.id);
            });

            if (savedM && Array.isArray(savedM.actionItems) && savedM.actionItems.length > 0) {
              return { ...m, actionItems: savedM.actionItems };
            }
            const savedActionsForM = localStorage.getItem(`salesgenie_actions_${m.id}`) || localStorage.getItem(`salesgenie_actions_${mNumId}`);
            if (savedActionsForM) {
              return { ...m, actionItems: JSON.parse(savedActionsForM) };
            }
            return m;
          });
        } catch (e) {
          console.warn("LocalStorage merge error:", e);
        }

        console.log("LOADED ACTION ITEMS:", JSON.stringify(mappedConvs.map(m => ({ id: m.id, actionItems: m.actionItems })), null, 2));

        setMeetings(mappedConvs);
        setSelectedMeetingId(prev => prev || mappedConvs[0].id);
      } else {
        setMeetings([]);
      }

      if (dbActivities) {
        setActivities(dbActivities);
      }
    } catch (e) {
      console.warn("ConversationsPage load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProspect?.id, prospectsList]);

  const handleTriggerSync = async () => {
    if (!selectedProspect?.id) {
      alert("Please select a lead first.");
      return;
    }
    setIsSyncing(true);
    try {
      await triggerCrmSync(selectedProspect.id, 'Salesforce');
      await loadData();

      const newAct = {
        id: `act-${Date.now()}`,
        type: 'CRM Synced',
        title: `Bi-directional CRM sync completed for ${selectedProspect.company}`,
        company: selectedProspect.company,
        timeAgo: 'Just now',
        icon: 'MailCheck'
      };
      setActivities(prev => [newAct, ...prev]);
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateActionItems = async (meetingId, updatedActionItems) => {
    console.log("SAVING ACTION ITEMS FOR MEETING:", meetingId);
    console.log("SAVING ACTION ITEMS:", JSON.stringify(updatedActionItems, null, 2));

    const cleanMeetingId = String(meetingId || '').replace(/\D/g, '');

    let targetInteractionId = null;

    setMeetings(prev => {
      const nextMeetings = prev.map(m => {
        const mCleanId = String(m.id || m.interaction_id || '').replace(/\D/g, '');
        if (mCleanId === cleanMeetingId || String(m.id) === String(meetingId)) {
          targetInteractionId = m.interaction_id || m.id;
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
      } catch (e) {}
      return nextMeetings;
    });

    if (targetInteractionId) {
      const numericId = parseInt(String(targetInteractionId).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        try {
          const res = await updateConversation(numericId, { action_items: updatedActionItems });
          console.log("BACKEND PUT RESPONSE:", JSON.stringify(res, null, 2));
        } catch (e) {
          console.warn("Action item persist error:", e);
        }
      }
    }
  };

  const handleAddMeeting = (newMeeting) => {
    setMeetings(prev => [newMeeting, ...prev]);
    setSelectedMeetingId(newMeeting.id);

    const newAct = {
      id: `act-${Date.now()}`,
      type: 'Transcript Analyzed',
      title: `Analyzed conversation transcript for ${newMeeting.clientName || 'Prospect'}`,
      company: newMeeting.company || selectedProspect?.company || 'Prospect',
      timeAgo: 'Just now',
      icon: 'FileText'
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const handlePushToCrm = async (meeting) => {
    const targetLeadId = meeting?.leadId || selectedProspect?.id;
    if (!targetLeadId) {
      alert("Please select a lead first.");
      return;
    }
    try {
      await triggerCrmSync(targetLeadId, 'Salesforce');
      await loadData();

      const newAct = {
        id: `act-${Date.now()}`,
        type: 'Pushed to CRM',
        title: `Pushed meeting takeaways and tasks to Salesforce CRM`,
        company: meeting.company || selectedProspect?.company,
        timeAgo: 'Just now',
        icon: 'Send'
      };
      setActivities(prev => [newAct, ...prev]);
    } catch (e) {
      console.warn("Push CRM error:", e);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <Milestone3Banner />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) minmax(400px, 1fr) minmax(280px, 320px)',
        gap: '1.25rem',
        alignItems: 'stretch',
        minHeight: '600px'
      }}>
        <CRMSyncStatus
          crmLogs={crmLogs}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncing}
        />

        <MeetingSummarizer
          meetings={meetings}
          selectedMeetingId={selectedMeetingId}
          setSelectedMeetingId={setSelectedMeetingId}
          onUpdateActionItems={handleUpdateActionItems}
          onOpenNewConversationModal={() => setIsModalOpen(true)}
          onPushToCrm={handlePushToCrm}
        />

        <RecentActivityFeed
          activities={activities}
          onAddActivityNote={handleAddActivityNote}
          currentCompany={selectedProspect?.company || 'Sales Pipeline'}
        />
      </div>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMeeting={handleAddMeeting}
        selectedProspect={selectedProspect}
        prospectsList={prospectsList}
      />
    </div>
  );
}
