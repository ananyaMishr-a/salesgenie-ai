import { useState } from 'react'
import { LoaderCircle, AlertCircle, Sparkles } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import { enrichCompanyData } from '../../api/leadsApi'

const STATUS_OPTIONS = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

function fieldsFromLead(lead) {
  return {
    company: lead?.company ?? '',
    contactName: lead?.contactName ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    industry: lead?.industry ?? '',
    companySize: lead?.companySize ?? '',
    annualRevenue: lead?.annualRevenue ?? '',
    location: lead?.location ?? '',
    fundingStage: lead?.fundingStage ?? '',
    techStack: lead?.techStack?.join(', ') ?? '',
    dealValue: lead?.dealValue ?? '',
    status: lead?.segment ?? 'New',
  }
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  )
}

/**
 * Shared Add / Edit lead form.
 * mode: 'create' | 'edit'. In 'edit' mode, pass the existing `lead` (the
 * camelCase shape from leadsApi's mapLead) to prefill the fields.
 * onSave(values) should call createLead/updateLead and throw on failure —
 * this component only closes itself once onSave resolves without throwing.
 */
export default function LeadFormModal({ mode, lead, onClose, onSave }) {
  const [values, setValues] = useState(() => fieldsFromLead(lead))
  const [touched, setTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const [formError, setFormError] = useState('')

  const companyError = touched && !values.company.trim() ? 'Company name is required' : ''
  const canSubmit = values.company.trim() && !isSaving

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    setFormError('')

    if (!values.company.trim()) return

    setIsSaving(true)
    try {
      await onSave(values)
      onClose()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleEnrich() {
    if (!values.company.trim()) {
      setFormError('Please enter a company name to enrich data.')
      return
    }
    
    setIsEnriching(true)
    setFormError('')
    
    try {
      const data = await enrichCompanyData(values.company)
      setValues(prev => ({
        ...prev,
        industry: data.industry !== 'Unknown (AI analysis unavailable)' ? data.industry : prev.industry,
        companySize: data.company_size !== 'Not available' ? data.company_size : prev.companySize,
        fundingStage: data.funding_stage !== 'Not available' ? data.funding_stage : prev.fundingStage,
        techStack: data.tech_stack.length > 0 ? data.tech_stack.join(', ') : prev.techStack
      }))
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsEnriching(false)
    }
  }

  return (
    <Modal title={mode === 'edit' ? 'Edit lead' : 'Add lead'} onClose={onClose}>
      {formError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Company name *"
                value={values.company}
                onChange={(e) => update('company', e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Acme Corp"
              />
            </div>
            <button
              type="button"
              onClick={handleEnrich}
              disabled={!values.company.trim() || isEnriching}
              className="mb-[1px] flex h-[38px] items-center gap-1.5 rounded-lg border border-brand bg-brand/5 px-3 text-xs font-semibold text-brand hover:bg-brand/10 disabled:opacity-50 transition-colors"
            >
              {isEnriching ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Auto-fill
            </button>
          </div>
          {companyError && <p className="mt-[-8px] text-xs text-red-600">{companyError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact name"
              value={values.contactName}
              onChange={(e) => update('contactName', e.target.value)}
              placeholder="Jane Doe"
            />
            <Input
              label="Email"
              type="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="jane@acme.com"
            />
            <Input
              label="Phone"
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+1 555 0100"
            />
            <Input
              label="Industry"
              value={values.industry}
              onChange={(e) => update('industry', e.target.value)}
              placeholder="Enterprise Software"
            />
            <Input
              label="Company size"
              value={values.companySize}
              onChange={(e) => update('companySize', e.target.value)}
              placeholder="250–500 employees"
            />
            <Input
              label="Annual revenue"
              value={values.annualRevenue}
              onChange={(e) => update('annualRevenue', e.target.value)}
              placeholder="$45M – $60M"
            />
            <Input
              label="Location"
              value={values.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
            <Input
              label="Funding stage"
              value={values.fundingStage}
              onChange={(e) => update('fundingStage', e.target.value)}
              placeholder="Series C"
            />
            <Input
              label="Deal value ($)"
              type="number"
              min="0"
              step="1000"
              value={values.dealValue}
              onChange={(e) => update('dealValue', e.target.value)}
              placeholder="0"
            />
            {mode === 'edit' && (
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Status
                </span>
                <select
                  value={values.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <Input
            label="Technology stack (comma-separated)"
            value={values.techStack}
            onChange={(e) => update('techStack', e.target.value)}
            placeholder="AWS, Python, React"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
          >
            {isSaving && <LoaderCircle size={14} className="animate-spin" />}
            {isSaving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add lead'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
