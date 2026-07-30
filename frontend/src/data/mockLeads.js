// Placeholder data for Milestone 1 (frontend-only).
// Replace with a fetch to the FastAPI backend once /api/leads is available —
// components in src/pages and src/components/leads expect this exact shape,
// so the swap should not require UI changes.

export const mockLeads = [
  {
    id: 'techcorp-solutions',
    company: 'TechCorp Solutions',
    contactName: 'Sarah Johnson',
    contactTitle: 'CTO',
    segment: 'Enterprise',
    lastActivity: '2h ago',
    industry: 'Enterprise Software',
    fundingStage: 'Series C',
    companySize: '250–500 employees',
    annualRevenue: '$45M – $60M',
    location: 'San Francisco, CA',
    fundingAmount: '$28M',
    techStack: ['AWS', 'Python', 'React', 'Node.js', 'Kubernetes', 'PostgreSQL'],
    qualificationScore: 92,
    insights: [
      {
        label: 'High Growth Potential',
        detail:
          'Series C funding indicates rapid expansion phase with likely budget for new tools.',
      },
      {
        label: 'Tech Alignment',
        detail: 'Current stack shows compatibility with our integration capabilities.',
      },
      {
        label: 'Decision Maker',
        detail: 'Contact holds a C-level title with direct budget authority.',
      },
    ],
  },
  {
    id: 'innovateai-labs',
    company: 'InnovateAI Labs',
    contactName: 'Mark Chen',
    contactTitle: 'VP Sales',
    segment: 'Mid-Market',
    lastActivity: '1d ago',
    industry: 'AI / Machine Learning',
    fundingStage: 'Series B',
    companySize: '80–150 employees',
    annualRevenue: '$12M – $20M',
    location: 'Austin, TX',
    fundingAmount: '$14M',
    techStack: ['GCP', 'Python', 'Vue', 'FastAPI', 'PostgreSQL'],
    qualificationScore: 78,
    insights: [
      {
        label: 'Active Buying Signal',
        detail: 'Recently posted job openings for a sales operations lead.',
      },
      {
        label: 'Tech Alignment',
        detail: 'Existing FastAPI usage lowers integration friction.',
      },
    ],
  },
  {
    id: 'dataflow-systems',
    company: 'DataFlow Systems',
    contactName: 'Emily Davis',
    contactTitle: 'CEO',
    segment: 'Startup',
    lastActivity: '3d ago',
    industry: 'Data Infrastructure',
    fundingStage: 'Seed',
    companySize: '10–25 employees',
    annualRevenue: '<$2M',
    location: 'Remote',
    fundingAmount: '$2.5M',
    techStack: ['AWS', 'Go', 'React'],
    qualificationScore: 61,
    insights: [
      {
        label: 'Early Stage',
        detail: 'Limited budget likely, but strong long-term account potential.',
      },
    ],
  },
  {
    id: 'cloudscale-inc',
    company: 'CloudScale Inc.',
    contactName: 'Robert Lee',
    contactTitle: 'Head of IT',
    segment: 'Enterprise',
    lastActivity: '5d ago',
    industry: 'Cloud Infrastructure',
    fundingStage: 'Series D',
    companySize: '600+ employees',
    annualRevenue: '$90M+',
    location: 'Seattle, WA',
    fundingAmount: '$60M',
    techStack: ['Azure', 'Java', 'Angular', 'Kubernetes'],
    qualificationScore: 84,
    insights: [
      {
        label: 'Renewal Window',
        detail: 'Current vendor contract believed to expire this quarter.',
      },
      {
        label: 'Decision Maker',
        detail: 'Head of IT typically owns tooling procurement at this size.',
      },
    ],
  },
]

export function getLeadById(id) {
  return mockLeads.find((lead) => lead.id === id)
}
