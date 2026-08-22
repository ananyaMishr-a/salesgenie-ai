import { apiClient } from "./client";
import { formatIST } from "./leadsApi";

/**
 * Milestone 3: Conversation Intelligence & CRM Services
 */

function getFutureDueDate(idx = 0) {
  const gaps = [2, 3, 5, 7];
  const offset = gaps[idx % gaps.length];
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
}

export function mapConversationFromApi(record, lead = null) {
  if (!record) return null;

  // 1. Normalize action_items (handles array of objects, JSON string, or single item)
  let parsedActions = [];
  const rawActions = record.action_items || record.actionItems;
  
  const mapSingleAction = (item, idx) => {
    if (typeof item === 'object' && item !== null) {
      const isCompleted = typeof item.completed === 'boolean' 
        ? item.completed 
        : item.status === 'completed';
      const ownerName = item.owner || item.assignee || 'Amanda';
      const actionText = item.text || item.description || String(item);
      const dueStr = item.dueDate || item.due_date || getFutureDueDate(idx);
      return {
        id: item.id || `a-${record.interaction_id || Date.now()}-${idx}`,
        owner: ownerName,
        assignee: ownerName,
        text: actionText,
        description: actionText,
        dueDate: dueStr,
        due_date: dueStr,
        completed: isCompleted,
        status: isCompleted ? 'completed' : 'pending',
        priority: item.priority || 'high'
      };
    }
    return {
      id: `a-${record.interaction_id || Date.now()}-${idx}`,
      owner: 'Amanda',
      assignee: 'Amanda',
      text: String(item),
      description: String(item),
      dueDate: getFutureDueDate(idx),
      due_date: getFutureDueDate(idx),
      completed: false,
      status: 'pending',
      priority: 'high'
    };
  };

  if (Array.isArray(rawActions)) {
    parsedActions = rawActions.map((item, idx) => mapSingleAction(item, idx));
  } else if (typeof rawActions === 'string') {
    try {
      const parsed = JSON.parse(rawActions);
      if (Array.isArray(parsed)) {
        parsedActions = parsed.map((item, idx) => mapSingleAction(item, idx));
      } else if (parsed && typeof parsed === 'object') {
        parsedActions = [mapSingleAction(parsed, 0)];
      } else if (String(parsed).trim()) {
        parsedActions = [mapSingleAction(String(parsed), 0)];
      }
    } catch {
      if (rawActions.trim()) {
        parsedActions = [mapSingleAction(rawActions.trim(), 0)];
      }
    }
  }

  // 2. Normalize summary paragraph
  const summaryStr = typeof record.summary === 'string'
    ? record.summary
    : record.summaryParagraph || record.raw_transcript || 'Meeting transcript analyzed.';

  // 3. Normalize discussion points (multi-topic support)
  let discussionPoints = [];
  const rawPoints = record.discussion_points || record.discussionPoints;
  
  const mapSinglePoint = (item, idx) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id || `dp-${record.interaction_id || Date.now()}-${idx}`,
        topic: item.topic || 'Key Takeaway',
        text: item.key_takeaway || item.text || String(item),
        sentiment: item.sentiment || 'positive'
      };
    }
    return {
      id: `dp-${record.interaction_id || Date.now()}-${idx}`,
      topic: 'Key Takeaway',
      text: String(item),
      sentiment: 'positive'
    };
  };

  if (Array.isArray(rawPoints)) {
    discussionPoints = rawPoints.map((item, idx) => mapSinglePoint(item, idx));
  } else if (typeof rawPoints === 'string') {
    try {
      const parsed = JSON.parse(rawPoints);
      if (Array.isArray(parsed)) {
        discussionPoints = parsed.map((item, idx) => mapSinglePoint(item, idx));
      }
    } catch {}
  }

  if (discussionPoints.length === 0) {
    discussionPoints = [
      {
        id: `dp-${record.interaction_id || Date.now()}-0`,
        topic: 'Executive Summary',
        text: summaryStr.length > 140 ? `${summaryStr.slice(0, 140)}...` : summaryStr,
        sentiment: 'positive'
      }
    ];
  }

  // 4. Normalize notes
  let parsedNotes = [];
  const rawNotes = record.notes;
  if (Array.isArray(rawNotes)) {
    parsedNotes = rawNotes;
  } else if (typeof rawNotes === 'string') {
    try {
      const p = JSON.parse(rawNotes);
      if (Array.isArray(p)) parsedNotes = p;
      else if (p) parsedNotes = [p];
    } catch {
      if (rawNotes.trim()) parsedNotes = [{ id: `n-${Date.now()}`, text: rawNotes.trim(), createdAt: dateStr }];
    }
  }

  const clientName = lead?.contactName || record.clientName || 'Prospect Contact';
  const companyName = lead?.company || record.company || 'Enterprise Prospect';
  const clientRole = lead?.role || record.clientRole || 'Decision Maker';
  const dateStr = record.interaction_date
    ? formatIST(record.interaction_date)
    : record.date || null;

  return {
    id: `m-${record.interaction_id || record.id || Date.now()}`,
    interaction_id: record.interaction_id || record.id,
    leadId: record.lead_id || lead?.id || null,
    clientName,
    clientRole,
    company: companyName,
    duration: record.duration || '35 min',
    date: dateStr,
    timestamp: dateStr,
    avatar: record.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sentiment: record.sentiment || 'AI Analyzed',
    dealStage: record.dealStage || 'Qualified',
    discussionPoints,
    actionItems: parsedActions,
    notes: parsedNotes,
    summaryParagraph: summaryStr,
    raw_transcript: record.raw_transcript || summaryStr
  };
}

export async function submitConversationTranscript(leadId, rawTranscript, interactionType = "Call") {
  if (!leadId) {
    throw new Error("Please select a lead first.");
  }
  const payload = {
    interaction_type: interactionType,
    raw_transcript: rawTranscript,
  };
  const data = await apiClient.post(`/leads/${leadId}/conversations`, payload);
  return data;
}

export async function fetchConversationsForLead(leadId) {
  if (!leadId) return [];
  const data = await apiClient.get(`/leads/${leadId}/conversations`);
  return data;
}

export async function fetchAllConversations() {
  const data = await apiClient.get("/conversations");
  return data;
}

export async function updateConversation(interactionId, updates) {
  if (!interactionId) return null;
  const data = await apiClient.put(`/conversations/${interactionId}`, updates);
  return data;
}

export async function triggerCrmSync(leadId, crmPlatform = "Salesforce") {
  if (!leadId) {
    throw new Error("Please select a lead first.");
  }
  const data = await apiClient.post(`/leads/${leadId}/crm-sync?crm_platform=${encodeURIComponent(crmPlatform)}`);
  return data;
}

export async function fetchCrmSyncLogs() {
  const data = await apiClient.get("/crm-sync-logs");
  return data;
}
