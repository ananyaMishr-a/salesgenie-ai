export const initialMeetings = [
  {
    id: "m-1",
    clientName: "Sarah Johnson",
    clientRole: "CTO",
    company: "TechCorp Solutions",
    duration: "45 min",
    date: "Today",
    timestamp: "10:30 AM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    sentiment: "High Interest (89% Positive)",
    dealStage: "Qualified",
    discussionPoints: [
      { id: 1, text: "Data processing bottlenecks affecting customer experience on legacy infrastructure", topic: "Pain Point", sentiment: "negative" },
      { id: 2, text: "Need for real-time analytics and reporting capabilities across enterprise systems", topic: "Requirement", sentiment: "neutral" },
      { id: 3, text: "Budget approved for Q3 technology infrastructure upgrade ($250k - $500k range)", topic: "Budget", sentiment: "positive" },
      { id: 4, text: "Competitive evaluation in progress with 2 other vendors (Salesforce Einstein & Gong)", topic: "Competition", sentiment: "neutral" }
    ],
    actionItems: [
      { id: "a-1", assignee: "Alex Thompson", text: "Send technical architecture document and integration guide", dueDate: "Jun 10", status: "pending", priority: "high" },
      { id: "a-2", assignee: "Sarah Johnson", text: "Schedule technical deep-dive with engineering team", dueDate: "Jun 12", status: "pending", priority: "high" },
      { id: "a-3", assignee: "Alex Thompson", text: "Provide ROI benchmarking comparison for enterprise tier", dueDate: "Jun 14", status: "completed", priority: "medium" }
    ],
    summaryParagraph: "Sarah highlighted critical data processing bottlenecks currently hindering their customer analytics pipeline. TechCorp has secured Q3 budget for an AI intelligence platform. Primary requirement is seamless FastAPI integration with their existing Salesforce CRM and custom data lake. Next step is a technical deep-dive on June 12th."
  },
  {
    id: "m-2",
    clientName: "Mark Chen",
    clientRole: "VP Sales",
    company: "InnovateAI Labs",
    duration: "30 min",
    date: "Yesterday",
    timestamp: "2:15 PM",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    sentiment: "Very High Interest (94% Positive)",
    dealStage: "Proposal Sent",
    discussionPoints: [
      { id: 1, text: "Looking to automate SDR cold email drafting and initial lead scoring", topic: "Automation", sentiment: "positive" },
      { id: 2, text: "Requires custom Hubspot webhooks for dynamic deal stage updates", topic: "Integration", sentiment: "positive" },
      { id: 3, text: "Requested security compliance verification (SOC2 Type II & GDPR)", topic: "Compliance", sentiment: "neutral" }
    ],
    actionItems: [
      { id: "a-4", assignee: "Mark Chen", text: "Review commercial proposal and pricing tier schedule", dueDate: "Jun 11", status: "completed", priority: "high" },
      { id: "a-5", assignee: "Alex Thompson", text: "Deliver SOC2 audit report summary to infosec team", dueDate: "Jun 09", status: "completed", priority: "medium" }
    ],
    summaryParagraph: "Mark evaluated SalesGenie's automated outreach generation and CRM sync workflows. InnovateAI aims to cut SDR manual lead qualification time by 75%. Commercial proposal sent for 50 user licenses with annual billing."
  },
  {
    id: "m-3",
    clientName: "Emily Davis",
    clientRole: "CEO",
    company: "DataFlow Systems",
    duration: "60 min",
    date: "3 days ago",
    timestamp: "4:00 PM",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    sentiment: "Moderate Interest (72% Positive)",
    dealStage: "Discovery",
    discussionPoints: [
      { id: 1, text: "Scaling revenue operations team from 10 to 45 SDRs in H2", topic: "Growth", sentiment: "positive" },
      { id: 2, text: "Concerned about data latency during peak conversation summarization loads", topic: "Performance", sentiment: "negative" }
    ],
    actionItems: [
      { id: "a-6", assignee: "Alex Thompson", text: "Arrange 1-on-1 demo with DataFlow CTO", dueDate: "Jun 15", status: "pending", priority: "medium" }
    ],
    summaryParagraph: "Emily explored scaling revenue ops with AI conversation intelligence. Addressed initial concerns around real-time summary latency. Follow-up demo set with engineering leadership."
  }
];

export const initialCrmLogs = [
  {
    id: "c-1",
    type: "Contact Synced",
    actionTag: "Added",
    tagColor: "emerald",
    contactName: "Sarah Johnson",
    contactRole: "CTO at TechCorp Solutions",
    platform: "Salesforce",
    timeAgo: "2 min ago",
    icon: "UserCheck",
    details: "New lead record synchronized with Salesforce Enterprise org ID #SF-8849"
  },
  {
    id: "c-2",
    type: "Activity Logged",
    actionTag: "Updated",
    tagColor: "blue",
    contactName: "Discovery Call Notes & Transcript",
    contactRole: "TechCorp Solutions",
    platform: "HubSpot",
    timeAgo: "15 min ago",
    icon: "FileText",
    details: "Initial outreach email sent and opened. Call recording transcript uploaded."
  },
  {
    id: "c-3",
    type: "Deal Stage Updated",
    actionTag: "Moved",
    tagColor: "purple",
    contactName: "TechCorp Expansion Deal ($250k)",
    contactRole: "Moved from 'Prospecting' to 'Qualified'",
    platform: "Salesforce",
    timeAgo: "1 hour ago",
    icon: "TrendingUp",
    details: "Automated qualification score triggered deal stage upgrade."
  },
  {
    id: "c-4",
    type: "Task Created",
    actionTag: "New",
    tagColor: "amber",
    contactName: "Schedule technical deep-dive",
    contactRole: "Assigned to Alex Thompson",
    platform: "HubSpot",
    timeAgo: "3 hours ago",
    icon: "Calendar",
    details: "HubSpot Task #HT-3021 generated automatically from conversation action items."
  },
  {
    id: "c-5",
    type: "Contact Synced",
    actionTag: "Added",
    tagColor: "emerald",
    contactName: "Mark Chen",
    contactRole: "VP Sales at InnovateAI",
    platform: "Salesforce",
    timeAgo: "1 day ago",
    icon: "UserCheck",
    details: "Lead created via website form integration webhook."
  }
];

export const initialRecentActivities = [
  {
    id: "ra-1",
    type: "Email Action",
    title: "Follow-up email opened by Sarah",
    company: "TechCorp Solutions",
    timeAgo: "30 min ago",
    icon: "MailCheck",
    color: "cyan"
  },
  {
    id: "ra-2",
    type: "Call Completed",
    title: "Discovery call completed (45 min)",
    company: "TechCorp Solutions",
    timeAgo: "2 hours ago",
    icon: "PhoneCall",
    color: "emerald"
  },
  {
    id: "ra-3",
    type: "Meeting Scheduled",
    title: "Demo scheduled for Jun 15 at 2:00 PM",
    company: "TechCorp Solutions",
    timeAgo: "Yesterday",
    icon: "CalendarCheck",
    color: "purple"
  },
  {
    id: "ra-4",
    type: "Note Added",
    title: 'Added note: "Technical team very interested in API capabilities*"',
    company: "TechCorp Solutions",
    timeAgo: "Yesterday",
    icon: "StickyNote",
    color: "amber"
  },
  {
    id: "ra-5",
    type: "Email Sent",
    title: "Initial outreach email sent",
    company: "TechCorp Solutions",
    timeAgo: "3 days ago",
    icon: "Send",
    color: "blue"
  }
];

export const fastApiEndpoints = [
  {
    id: "ep-1",
    method: "POST",
    path: "/api/v1/conversations/summarize",
    title: "Summarize Sales Call / Meeting",
    description: "Ingests raw transcript or audio stream, performs sentiment analysis, extracts key discussion points, and identifies action items.",
    samplePayload: {
      call_id: "call_993821",
      prospect_id: "lead_448",
      audio_url: "https://storage.salesgenie.ai/recordings/call_993821.mp3",
      transcript: "Sarah Johnson: We have severe data processing bottlenecks on legacy infrastructure... Alex: SalesGenie can automate real-time intelligence feeds directly to your CRM.",
      crm_platform: "salesforce"
    },
    sampleResponse: {
      status: "success",
      processing_time_ms: 412,
      confidence_score: 0.96,
      summary: "Customer experiencing data processing bottlenecks. Secured Q3 budget for upgrade.",
      discussion_points_count: 4,
      action_items_count: 3,
      lead_qualification_boost: "+24 points"
    }
  },
  {
    id: "ep-2",
    method: "POST",
    path: "/api/v1/crm/sync",
    title: "Synchronize Sales Entities",
    description: "Bi-directional sync trigger between SalesGenie AI database and external CRM systems (Salesforce, HubSpot, Zoho).",
    samplePayload: {
      crm_type: "salesforce",
      sync_type: "incremental",
      entities: ["contacts", "activities", "tasks", "deals"],
      force_overwrite: false
    },
    sampleResponse: {
      status: "synced",
      timestamp: "2026-08-10T13:49:00Z",
      records_processed: 48,
      records_created: 3,
      records_updated: 45,
      errors: []
    }
  },
  {
    id: "ep-3",
    method: "POST",
    path: "/api/v1/webhooks/salesforce",
    title: "Salesforce Lead Status Webhook Listener",
    description: "Listens to Salesforce outbound messages to trigger real-time AI conversation analysis and score re-calculation.",
    samplePayload: {
      event_type: "lead.updated",
      object_id: "00Q5g000003kLMN",
      changes: {
        StageName: { old: "Prospecting", new: "Qualified" }
      }
    },
    sampleResponse: {
      received: true,
      action_taken: "Triggered AI Next-Best-Action Workflow",
      workflow_id: "wf_7721"
    }
  }
];

export const initialProspects = [
  {
    id: 'p-1',
    company: 'amazon',
    contactName: 'Jane Doe',
    role: 'Procurement',
    tier: 'Enterprise',
    industry: 'software',
    timeAgo: '1h ago',
    size: '10000+ employees',
    revenue: '$1B+',
    location: 'Seattle, WA',
    funding: 'Public',
    techStack: ['AWS', 'React', 'Python'],
    qualificationScore: 90,
    insights: []
  },
  {
    id: 'p-2',
    company: 'Facebook',
    contactName: 'Raj Sharma',
    role: 'Engineering Lead',
    tier: 'Enterprise',
    industry: 'Social Media & Technology',
    timeAgo: '2h ago',
    size: '10000+ employees',
    revenue: '$1B+',
    location: 'Menlo Park, CA',
    funding: 'Public',
    techStack: ['React', 'Hack', 'GraphQL'],
    qualificationScore: 80,
    insights: []
  },
  {
    id: 'p-3',
    company: 'Meta',
    contactName: 'Sam Darling',
    role: 'Product Manager',
    tier: 'Enterprise',
    industry: 'Technology & Social Media',
    timeAgo: '3h ago',
    size: '10000+ employees',
    revenue: '$1B+',
    location: 'London, UK',
    funding: 'Public',
    techStack: ['React', 'Python'],
    qualificationScore: 80,
    insights: []
  },
  {
    id: 'p-4',
    company: 'SouledStore',
    contactName: 'Kevin Kapoor',
    role: 'Marketing',
    tier: 'Mid-Market',
    industry: 'E-commerce / Apparel & Fashion',
    timeAgo: '5h ago',
    size: '500-1000 employees',
    revenue: '$50M - $100M',
    location: 'Mumbai, India',
    funding: 'Private',
    techStack: ['Shopify', 'Node.js'],
    qualificationScore: 70,
    insights: []
  },
  {
    id: 'p-5',
    company: 'Flipkart',
    contactName: 'Aditi Desai',
    role: 'Supply Chain Head',
    tier: 'Enterprise',
    industry: 'e commerce',
    timeAgo: '1d ago',
    size: '10000+ employees',
    revenue: '$1B+',
    location: 'Bengaluru, India',
    funding: 'Acquired',
    techStack: ['Java', 'Spring', 'MySQL'],
    qualificationScore: 70,
    insights: []
  },
  {
    id: 'p-6',
    company: 'Myntra',
    contactName: 'Vikram Singh',
    role: 'VP Fashion',
    tier: 'Enterprise',
    industry: 'e commerce',
    timeAgo: '2d ago',
    size: '5000-10000 employees',
    revenue: '$500M+',
    location: 'Bengaluru, India',
    funding: 'Acquired',
    techStack: ['Node.js', 'React', 'MongoDB'],
    qualificationScore: 70,
    insights: []
  },
  {
    id: 'p-7',
    company: 'TechCorp Solutions',
    contactName: 'Sarah Johnson',
    role: 'CTO',
    tier: 'Enterprise',
    industry: 'Enterprise Technology',
    timeAgo: '2h ago',
    size: '250-500 employees',
    revenue: '$45M - $60M',
    location: 'San Francisco, CA',
    funding: 'Series C • $28M',
    techStack: ['AWS', 'Python', 'React', 'Node.js', 'Kubernetes', 'PostgreSQL'],
    qualificationScore: 92,
    insights: [
      { type: 'High Growth Potential', detail: 'Series C funding indicates rapid expansion phase with likely budget for new tools.' },
      { type: 'Tech Alignment', detail: 'Current stack shows compatibility with our integration capabilities.' },
      { type: 'Decision Maker', detail: 'CTO Sarah Johnson identified as primary technical buyer.' }
    ]
  },
  {
    id: 'p-8',
    company: 'InnovateAI Labs',
    contactName: 'Mark Chen',
    role: 'VP Sales',
    tier: 'Mid-Market',
    industry: 'Technology',
    timeAgo: '1d ago',
    size: '100-250 employees',
    revenue: '$15M - $30M',
    location: 'Boston, MA',
    funding: 'Series B • $15M',
    techStack: ['GCP', 'Python', 'Vue.js', 'Docker', 'HubSpot'],
    qualificationScore: 88,
    insights: [
      { type: 'High Growth Potential', detail: 'Expanding revenue operations team rapidly.' },
      { type: 'Tech Alignment', detail: 'Active user of HubSpot requiring webhook automation.' },
      { type: 'Decision Maker', detail: 'VP Sales evaluating SDR productivity software.' }
    ]
  }
];

export const presetTranscripts = [
  {
    title: "CloudBridge Systems - Security & Uptime Review",
    clientName: "Sarah Jenkins",
    clientRole: "VP of Infrastructure",
    company: "CloudBridge Systems",
    duration: "40 min",
    transcriptText: "Sarah Jenkins: We need 99.99% uptime and zero downtime deployment for our multi-cloud microservices. We also require HIPAA and SOC2 compliance validation before moving forward. Amanda: I will send over the HIPAA security whitepaper and technical architecture diagrams by Friday. Sarah Jenkins: Great, our team will review the technical architecture with legal by next Tuesday."
  },
  {
    title: "CloudScale Inc. - Infrastructure & AI Expansion",
    clientName: "Robert Lee",
    clientRole: "Head of IT",
    company: "CloudScale Inc.",
    duration: "40 min",
    transcriptText: "Robert Lee: Hi Alex. CloudScale is scaling fast and our SDR team is overwhelmed manually entering call notes into Salesforce. We spend 15 hours a week per rep on data entry. We need automatic call summarization, action item extraction, and instantaneous CRM activity sync. Alex: SalesGenie AI connects natively to Salesforce with our FastAPI endpoints, extracting key takeaways within 500ms after call completion. Robert: Perfect, our budget is $180k for this fiscal year, and we want to deploy by next month."
  },
  {
    title: "NexGen Retail - Multi-channel Outreach & CRM Sync",
    clientName: "Amanda Cross",
    clientRole: "Director of Revenue Operations",
    company: "NexGen Retail",
    duration: "35 min",
    transcriptText: "Amanda: We currently use HubSpot for outreach but lack AI intelligence on customer meetings. We want every Zoom call summarized, key pain points categorized, and follow-up tasks pushed directly into HubSpot deal records. Alex: SalesGenie supports HubSpot OAuth integration out of the box. We auto-generate tasks with assignees and due dates right after the meeting ends. Amanda: Excellent, let's schedule a pilot for 20 sales representatives starting Monday."
  }
];
