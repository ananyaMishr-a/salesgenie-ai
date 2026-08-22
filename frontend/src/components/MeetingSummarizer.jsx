import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Clock, 
  Building2, 
  ListChecks, 
  CheckSquare, 
  Square,
  Copy,
  Check,
  FileText,
  Plus,
  Send,
  HeartHandshake,
  Trash2,
  AlertCircle,
  StickyNote
} from 'lucide-react';
import { triggerCrmSync } from '../api/conversationsApi';

export default function MeetingSummarizer({ 
  meetings = [], 
  selectedMeetingId, 
  setSelectedMeetingId, 
  onUpdateActionItems,
  onUpdateNotes,
  onOpenNewConversationModal,
  onPushToCrm
}) {
  const [copied, setCopied] = useState(false);
  const [pushedToCrm, setPushedToCrm] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'transcript'
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Amanda');
  const [newNoteText, setNewNoteText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const currentMeeting = meetings.find(m => String(m.id) === String(selectedMeetingId)) || meetings[0];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentMeeting || !onUpdateNotes) return;
    const now = new Date();
    const formattedDate = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }) + " IST";

    const newNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: formattedDate
    };

    const existingNotes = Array.isArray(currentMeeting.notes) ? currentMeeting.notes : [];
    const updated = [newNote, ...existingNotes];
    onUpdateNotes(currentMeeting.id, updated);
    setNewNoteText('');
  };

  const handleDeleteNote = (noteId) => {
    if (!currentMeeting || !onUpdateNotes) return;
    const existingNotes = Array.isArray(currentMeeting.notes) ? currentMeeting.notes : [];

    const updated = existingNotes.filter((n, idx) => {
      const matchId = n.id ? String(n.id) === String(noteId) : String(idx) === String(noteId);
      return !matchId;
    });
    onUpdateNotes(currentMeeting.id, updated);
  };

  const handleCopy = () => {
    if (!currentMeeting) return;
    const discussionList = currentMeeting.discussionPoints || [];
    const actionList = currentMeeting.actionItems || [];

    const textToCopy = `Meeting Summary: ${currentMeeting.clientName || 'Prospect'} (${currentMeeting.company || 'Company'})\n\nKey Discussion Points:\n` +
      discussionList.map(p => `- ${p.text}`).join('\n') +
      `\n\nAction Items:\n` +
      actionList.map(a => `- ${a.assignee}: ${a.text} (Due: ${a.dueDate || 'Pending'})`).join('\n');
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushCrm = async () => {
    setErrorMessage(null);
    const targetId = currentMeeting?.leadId || currentMeeting?.interaction_id;
    if (!targetId) {
      setErrorMessage("Please select a lead first.");
      return;
    }

    try {
      await triggerCrmSync(targetId, 'Salesforce');
      if (onPushToCrm) {
        onPushToCrm(currentMeeting);
      }
      setPushedToCrm(true);
      setTimeout(() => setPushedToCrm(false), 2500);
    } catch (err) {
      setErrorMessage(err?.message || "CRM sync failed. Please try again.");
    }
  };

  const handleToggleAction = (actionId, targetChecked = null) => {
    if (!currentMeeting || !onUpdateActionItems) return;
    const list = Array.isArray(currentMeeting.actionItems) ? currentMeeting.actionItems : [];
    
    const targetAction = list.find(a => String(a.id) === String(actionId));
    const newChecked = typeof targetChecked === 'boolean' 
      ? targetChecked 
      : !(targetAction?.completed === true);

    console.log("TOGGLE START");
    console.log("Action ID:", actionId);
    console.log("New checked value:", newChecked);

    const updatedActions = list.map(a => {
      if (String(a.id) === String(actionId)) {
        return {
          ...a,
          completed: newChecked,
          status: newChecked ? 'completed' : 'pending'
        };
      }
      return a;
    });

    console.log("UPDATED ACTION ITEMS:", JSON.stringify(updatedActions, null, 2));

    onUpdateActionItems(currentMeeting.id, updatedActions);
  };

  const handleAddActionItem = (e) => {
    e.preventDefault();
    if (!newActionText.trim() || !currentMeeting || !onUpdateActionItems) return;

    const count = (currentMeeting.actionItems || []).length;
    const gaps = [2, 3, 5, 7];
    const offset = gaps[count % gaps.length];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dueDateStr = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
    const ownerName = newActionAssignee.trim() || 'Amanda';
    const textStr = newActionText.trim();

    const newItem = {
      id: `action-${Date.now()}`,
      owner: ownerName,
      assignee: ownerName,
      text: textStr,
      description: textStr,
      dueDate: dueDateStr,
      due_date: dueDateStr,
      completed: false,
      status: 'pending',
      priority: 'high'
    };

    const list = Array.isArray(currentMeeting.actionItems) ? currentMeeting.actionItems : [];
    const updated = [...list, newItem];
    onUpdateActionItems(currentMeeting.id, updated);
    setNewActionText('');
  };

  const handleDeleteAction = (actionId) => {
    if (!currentMeeting || !onUpdateActionItems) return;
    const list = Array.isArray(currentMeeting.actionItems) ? currentMeeting.actionItems : [];
    const updated = list.filter(a => a.id !== actionId);
    onUpdateActionItems(currentMeeting.id, updated);
  };

  return (
    <div className="pdf-panel-card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Meeting Summary
          </h3>

          {/* Summary / Transcript View Mode Buttons */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.15rem', borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                background: viewMode === 'summary' ? '#ffffff' : 'transparent',
                color: viewMode === 'summary' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '0.2rem 0.5rem',
                borderRadius: '5px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('transcript')}
              style={{
                background: viewMode === 'transcript' ? '#ffffff' : 'transparent',
                color: viewMode === 'transcript' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '0.2rem 0.5rem',
                borderRadius: '5px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Transcript
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {meetings && meetings.length > 0 && (
            <select
              value={selectedMeetingId || ''}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none'
              }}
            >
              {meetings.map(m => (
                <option key={m.id} value={m.id}>
                  {m.clientName || 'Prospect'} - {m.company || 'Meeting'}
                </option>
              ))}
            </select>
          )}

          <span className="badge-ai-purple">
            <Sparkles size={12} /> AI Powered
          </span>
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <AlertCircle size={14} /> {errorMessage}
        </div>
      )}

      {/* Content Section */}
      {!currentMeeting ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
          <FileText size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>No Conversations Analyzed Yet</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '340px', marginBottom: '1.25rem' }}>
            Submit a meeting call transcript to extract executive summaries, key discussion points, and action items.
          </p>
          <button onClick={onOpenNewConversationModal} className="btn-blue-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
            <Sparkles size={15} /> Analyze New Transcript
          </button>
        </div>
      ) : (
        <>
          {/* Subheader Meta Bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.8125rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#0f172a' }}>
                <User size={15} color="#475569" />
                {currentMeeting.clientName || 'Prospect'}, {currentMeeting.clientRole || 'Executive'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b' }}>
                <Clock size={14} />
                {currentMeeting.duration || '30 min'} • {currentMeeting.date || 'Recently'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#2563eb', fontWeight: 600 }}>
                <Building2 size={14} />
                {currentMeeting.company || 'Enterprise Client'}
              </div>
            </div>

            {/* Sentiment Badge */}
            {currentMeeting.sentiment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                <HeartHandshake size={12} /> {currentMeeting.sentiment}
              </div>
            )}
          </div>

          <div className="custom-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '4px' }}>
            {(() => {
              const discussionPoints = Array.isArray(currentMeeting.discussionPoints) ? currentMeeting.discussionPoints : [];
              const actionItems = Array.isArray(currentMeeting.actionItems) ? currentMeeting.actionItems : [];

              return viewMode === 'summary' ? (
                <>
                  {/* Executive Brief Paragraph */}
                  {currentMeeting.summaryParagraph && (
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78125rem', color: '#0369a1', lineHeight: '1.5' }}>
                      <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#0284c7', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        AI Executive Brief
                      </strong>
                      {currentMeeting.summaryParagraph}
                    </div>
                  )}

                  {/* Key Discussion Points */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      <ListChecks size={16} color="#2563eb" />
                      Key Discussion Points
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {discussionPoints.map((point, idx) => (
                        <div key={point.id || idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          background: '#ffffff',
                          border: '1px solid #f1f5f9',
                          borderRadius: '6px',
                          padding: '0.5rem 0.625rem',
                          fontSize: '0.8125rem',
                          color: '#334155',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', marginTop: '0.45rem', flexShrink: 0 }} />
                            <span>{point.text || String(point)}</span>
                          </div>
                          {point.topic && (
                            <span style={{ fontSize: '0.625rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                              {point.topic}
                            </span>
                          )}
                        </div>
                      ))}

                      {discussionPoints.length === 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                          No discussion points recorded.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                        <CheckSquare size={16} color="#059669" />
                        Action Items ({actionItems.filter(a => a.completed === true).length}/{actionItems.length} Completed)
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {actionItems.map((action, idx) => {
                        const isDone = Boolean(action.completed === true);
                        return (
                          <div key={action.id || idx} style={{
                            background: isDone ? '#f0fdf4' : '#ffffff',
                            border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.625rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => handleToggleAction(action.id, !isDone)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleAction(action.id, e.target.checked);
                                }}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                              />
                              <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isDone ? '#64748b' : '#0f172a', textDecoration: isDone ? 'line-through' : 'none' }}>
                                  <strong style={{ color: '#2563eb' }}>{action.assignee || action.owner || 'Assignee'}:</strong> {action.text || String(action)}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                background: '#ffedd5',
                                color: '#c2410c',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                Due: {action.dueDate || 'No due date'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAction(action.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '0.2rem',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Delete Action Item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Quick Action Item */}
                      <form onSubmit={handleAddActionItem} style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
                        <input
                          type="text"
                          placeholder="Add new action item..."
                          value={newActionText}
                          onChange={(e) => setNewActionText(e.target.value)}
                          style={{
                            flex: 1,
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.75rem',
                            color: '#0f172a',
                            outline: 'none'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Assignee"
                          value={newActionAssignee}
                          onChange={(e) => setNewActionAssignee(e.target.value)}
                          style={{
                            width: '110px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.75rem',
                            color: '#0f172a',
                            outline: 'none'
                          }}
                        />
                        <button type="submit" className="btn-light-secondary" style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}>
                          <Plus size={13} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Persistent Meeting Notes Section */}
                  {(() => {
                    const notesList = Array.isArray(currentMeeting?.notes) ? currentMeeting.notes : [];

                    return (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                            <StickyNote size={16} color="#d97706" />
                            Meeting Notes ({notesList.length})
                          </div>
                        </div>

                        {/* Add Meeting Note Input + Add Button */}
                        <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                          <input
                            type="text"
                            placeholder="Add meeting note..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            style={{
                              flex: 1,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '0.45rem 0.75rem',
                              fontSize: '0.8125rem',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="submit"
                            disabled={!newNoteText.trim()}
                            style={{
                              background: newNoteText.trim() ? '#2563eb' : '#94a3b8',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.45rem 0.875rem',
                              fontSize: '0.78125rem',
                              fontWeight: 700,
                              cursor: newNoteText.trim() ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Plus size={14} /> Add Note
                          </button>
                        </form>

                        {/* Meeting Notes Cards */}
                        {notesList.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {notesList.map((n, idx) => (
                              <div
                                key={n.id || `note-${idx}`}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  padding: '0.75rem 0.875rem',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem'
                                }}
                              >
                                <div style={{ fontSize: '0.8125rem', color: '#1e293b', fontWeight: 500, lineHeight: '1.5' }}>
                                  {n.text || String(n)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid #f1f5f9' }}>
                                  <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                                    {n.createdAt || n.created_at || 'Recently added'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleDeleteNote(n.id || idx);
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#94a3b8',
                                      cursor: 'pointer',
                                      padding: '0.2rem',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'color 0.15s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    title="Delete meeting note"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                            No meeting notes added yet. Use the input above to add notes.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                /* Transcript Raw View */
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    <FileText size={16} color="#7c3aed" /> Full Conversation Audio Transcript
                  </div>
                  <p style={{ fontSize: '0.8125rem', lineHeight: '1.6', color: '#334155', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-line' }}>
                    {currentMeeting.raw_transcript || currentMeeting.summaryParagraph}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn-light-secondary">
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Notes'}
              </button>
              <button onClick={handlePushCrm} className="btn-light-secondary" style={{ color: '#2563eb', borderColor: '#bfdbfe' }}>
                {pushedToCrm ? <Check size={14} color="#15803d" /> : <Send size={14} />}
                {pushedToCrm ? 'Pushed to CRM!' : 'Push to CRM'}
              </button>
            </div>

            <button onClick={onOpenNewConversationModal} className="btn-blue-primary">
              <Sparkles size={14} /> Analyze New Transcript
            </button>
          </div>
        </>
      )}
    </div>
  );
}
