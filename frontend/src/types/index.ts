// TypeScript interfaces matching SalesGenie AI backend domain models

export interface Lead {
  id: number;
  company: string;
  company_name: string;
  industry: string;
  contactName: string;
  contact_name: string;
  contactTitle?: string;
  role: string;
  email: string;
  phone?: string;
  companySize?: string;
  size?: string;
  annualRevenue?: string;
  revenue?: string;
  location?: string;
  fundingStage?: string;
  funding?: string;
  techStack: string[];
  technology_stack?: string;
  status: 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';
  segment?: string;
  tier: string;
  dealValue: number;
  deal_value?: number;
  lastActivity?: string;
  timeAgo?: string;
  qualificationScore: number;
  qualification_score?: number;
  insights?: IntelligenceReport[] | IntelligenceObject | string;
  hasIntelligence?: boolean;
}

export interface IntelligenceReport {
  type: string;
  label?: string;
  detail: string;
}

export interface IntelligenceObject {
  companyOverview?: string;
  businessNeeds?: string;
  business_needs?: string;
  opportunities?: string;
  industryAnalysis?: string;
  industry_analysis?: string;
  growthSignals?: string;
  recommendedApproach?: string;
}

export interface ScoringMetrics {
  qualificationScore: number;
  conversionProbability: number;
  priorityLevel: 'High Priority' | 'Medium Priority' | 'Low Priority';
  scoringFactors: Record<string, number | string>;
}

export interface OutreachTemplate {
  email_subject?: string;
  subject?: string;
  email_content?: string;
  content?: string;
  tone?: 'Professional' | 'Casual' | 'Direct';
}

export interface OutreachStrategy {
  followup_timing?: string;
  channel_mix?: string;
  content_strategy?: string;
  timing?: string;
  channels?: string;
  strategy?: string;
}

export interface SalesInteraction {
  id: string | number;
  interaction_id?: number;
  leadId?: number;
  lead_id?: number;
  clientName: string;
  clientRole: string;
  company: string;
  duration?: string;
  date?: string;
  timestamp?: string;
  avatar?: string;
  sentiment?: string;
  dealStage?: string;
  discussionPoints?: Array<{ id: number | string; text: string; topic?: string; sentiment?: string }>;
  actionItems?: Array<{ id: string; assignee: string; text: string; dueDate?: string; status: 'pending' | 'completed'; priority?: string }>;
  summaryParagraph?: string;
  summary?: string;
  raw_transcript?: string;
}

export interface CRMSyncLog {
  id: string;
  sync_id?: number;
  lead_id?: number;
  type?: string;
  actionTag?: string;
  sync_status?: string;
  tagColor?: string;
  contactName?: string;
  contactRole?: string;
  platform?: string;
  crm_platform?: string;
  timeAgo?: string;
  timestamp?: string;
  icon?: string;
  details?: string;
}

export interface DashboardKPIs {
  conversion_rate: string;
  conversion_change: string;
  pipeline_value: string;
  pipeline_change: string;
  avg_response_time: string;
  response_change: string;
  avg_sales_cycle: string;
  cycle_change: string;
}

export interface FollowUpRecommendation {
  id: number | string;
  lead_id?: number;
  company_name?: string;
  title: string;
  description: string;
  priority_level?: string;
  priority?: string;
  time_ago?: string;
  timeAgo?: string;
}
