import { useState, useMemo } from 'react'
import { Sparkles, ArrowUpDown, Filter } from 'lucide-react'

export default function LeadDashboard({ leads, onGenerateOutreach }) {
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' | 'asc'
  const [filterIndustry, setFilterIndustry] = useState('All')

  const industries = useMemo(() => {
    const inds = new Set(leads.map(l => l.industry).filter(Boolean))
    return ['All', ...Array.from(inds)]
  }, [leads])

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads]

    if (filterIndustry !== 'All') {
      result = result.filter(l => l.industry === filterIndustry)
    }

    result.sort((a, b) => {
      const scoreA = a.qualificationScore || 0
      const scoreB = b.qualificationScore || 0
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
    })

    return result
  }, [leads, sortOrder, filterIndustry])

  const getScoreBadge = (score) => {
    if (!score && score !== 0) return <span className="text-gray-400">Not Scored</span>
    if (score >= 80) return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">🔥 Hot ({score})</span>
    if (score >= 50) return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">🟡 Warm ({score})</span>
    return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">❄️ Cold ({score})</span>
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-surface-border overflow-hidden shadow-sm">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-surface-border px-6 py-4 bg-brand text-white">
        <h2 className="text-lg font-semibold text-white">Lead Scoring Dashboard</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white-muted" />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="rounded-md border-surface-border bg-white text-sm text-ink outline-none ring-brand focus:ring-2"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white-muted hover:bg-surface-sunken hover:text-ink transition-colors"
          >
            <ArrowUpDown size={16} />
            Sort by Score
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-ink whitespace-nowrap">
          <thead className="sticky top-0 bg-surface-sunken text-ink-muted shadow-[0_1px_0_0_#e5e7eb]">
            <tr>
              <th className="px-6 py-3 font-semibold">Lead</th>
              <th className="px-6 py-3 font-semibold">Company & Industry</th>
              <th className="px-6 py-3 font-semibold">Score</th>
              <th className="px-6 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredAndSortedLeads.length > 0 ? (
              filteredAndSortedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink">{lead.contactName || 'Unknown Contact'}</div>
                    <div className="text-ink-lighter">{lead.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{lead.company}</div>
                    <div className="text-ink-lighter">{lead.industry || 'Unknown industry'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getScoreBadge(lead.qualificationScore)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onGenerateOutreach(lead)}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white transition-all opacity-100 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Sparkles size={16} />
                      Generate Outreach
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-ink-muted">
                  No leads match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
