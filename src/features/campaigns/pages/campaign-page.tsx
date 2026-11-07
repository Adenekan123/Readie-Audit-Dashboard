import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Clock3, Filter, LayoutGrid, Search, ShieldAlert, ShieldCheck, Table2, UsersRound, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineLoader } from '@/components/ui/loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetCampaignJobs } from '@/hooks/api/use-get-campaign-jobs'
import { toCandidateSession } from '@/features/campaigns/model/to-candidate-session'
import { AssessmentTable } from '@/features/campaigns/components/assessment-table'
import { CandidateGrid, GRID_PAGE_SIZE, GridPagination } from '@/features/campaigns/components/candidate-grid'
import { CampaignSwitcher } from '@/features/campaigns/components/campaign-switcher'
import { NoAssessmentSessions } from '@/features/campaigns/components/no-assessment-sessions'
import type { CandidateStatus, CampaignId } from '@/shared/types/candidate'

type StatusFilter = CandidateStatus | ''
type AssessmentLayout = 'grid' | 'table'
type SortOrder = 'newest' | 'oldest'

const statusOptions: { value: StatusFilter; label: string; tone: string }[] = [
  { value: '', label: 'All assessments', tone: 'all' },
  { value: 'Completed', label: 'Completed', tone: 'completed' },
  { value: 'In progress', label: 'In progress', tone: 'progress' },
  { value: 'Failed', label: 'Failed', tone: 'failed' },
]

type SummaryIconKind = 'people' | 'complete' | 'progress' | 'failed'

function SummaryIcon({ kind }: { kind: SummaryIconKind }) {
  const icons = {
    people: UsersRound,
    complete: ShieldCheck,
    progress: Clock3,
    failed: ShieldAlert,
  }
  const Icon = icons[kind]

  return <Icon aria-hidden="true" className="stat-icon" strokeWidth={1.5} />
}

function CampaignStatusFilter({
  className = '',
  countForStatus,
  onStatusChange,
  statusFilter,
}: {
  className?: string
  countForStatus: (status: StatusFilter) => number
  onStatusChange: (value: StatusFilter) => void
  statusFilter: StatusFilter
}) {
  return (
    <Tabs className={`status-filter-root ${className}`} onValueChange={(value) => onStatusChange(value === 'all' ? '' : value as CandidateStatus)} value={statusFilter || 'all'}>
      <TabsList aria-label="Filter assessments by status" className="status-tabs" variant="line">
        {statusOptions.map((option) => (
          <TabsTrigger className={`status-tab ${option.tone}`} key={option.label} value={option.value || 'all'}>
            <span aria-hidden="true" className="status-dot" />{option.label}<span className="status-tab-count">{countForStatus(option.value)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function CampaignFilterControls({
  campaignId,
  countForStatus,
  emailQuery,
  layout,
  onEmailChange,
  onLayoutChange,
  onSortChange,
  onStatusChange,
  showLayout = true,
  showSearch = true,
  showStatus = true,
  sortOrder,
  statusFilter,
}: {
  campaignId: CampaignId
  countForStatus: (status: StatusFilter) => number
  emailQuery: string
  layout: AssessmentLayout
  onEmailChange: (value: string) => void
  onLayoutChange: (value: AssessmentLayout) => void
  onSortChange: (value: SortOrder) => void
  onStatusChange: (value: StatusFilter) => void
  showLayout?: boolean
  showSearch?: boolean
  showStatus?: boolean
  sortOrder: SortOrder
  statusFilter: StatusFilter
}) {
  return (
    <>
      <div className="toolbar">
        {showSearch && <label className="search">
          <Input aria-label="Search candidate email" autoComplete="off" className="search-input" onChange={(event) => onEmailChange(event.target.value)} placeholder="Search candidate email…" type="search" value={emailQuery} />
          <span aria-hidden="true"><Search strokeWidth={1.7} /></span>
        </label>}
        <CampaignSwitcher campaignId={campaignId} />
        <div className="filter-control sort-inline">
          <ArrowUpDown aria-hidden="true" strokeWidth={1.7} />
          <Select value={sortOrder} onValueChange={(value) => onSortChange(value as SortOrder)}>
            <SelectTrigger aria-label="Sort assessments by submission date" className="control-select-trigger"><SelectValue /></SelectTrigger>
            <SelectContent align="start" className="dashboard-select-content" position="popper" side="bottom">
              <SelectItem className="dashboard-select-item" value="newest">Newest first</SelectItem>
              <SelectItem className="dashboard-select-item" value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showLayout && <div aria-label="Assessment layout" className="layout-switch" role="group">
          <Button aria-label="Grid view" aria-pressed={layout === 'grid'} onClick={() => onLayoutChange('grid')} type="button" variant="ghost"><LayoutGrid aria-hidden="true" />Grid</Button>
          <Button aria-label="Table view" aria-pressed={layout === 'table'} onClick={() => onLayoutChange('table')} type="button" variant="ghost"><Table2 aria-hidden="true" />Table</Button>
        </div>}
      </div>
      {showStatus && <CampaignStatusFilter countForStatus={countForStatus} onStatusChange={onStatusChange} statusFilter={statusFilter} />}
    </>
  )
}

export function CampaignPage({ campaignId }: { campaignId: CampaignId }) {
  const jobsQuery = useGetCampaignJobs(campaignId, { retry: false })
  const candidates = useMemo(
    () => jobsQuery.data?.map((job) => toCandidateSession(job, campaignId)) ?? [],
    [jobsQuery.data, campaignId],
  )
  const [emailQuery, setEmailQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [layout, setLayout] = useState<AssessmentLayout>('table')
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [paginationReset, setPaginationReset] = useState(false)
  const [pageSize, setPageSize] = useState(5)
  const [gridPage, setGridPage] = useState(1)
  const resetPagination = () => {
    setPaginationReset((current) => !current)
    setGridPage(1)
  }

  useEffect(() => {
    setPaginationReset((current) => !current)
    setGridPage(1)
  }, [campaignId])

  useEffect(() => {
    const mobileBreakpoint = window.matchMedia('(max-width: 700px)')
    const updateMobileLayout = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mobileBreakpoint.addEventListener('change', updateMobileLayout)
    return () => mobileBreakpoint.removeEventListener('change', updateMobileLayout)
  }, [])

  useEffect(() => {
    if (isMobile) setGridPage(1)
  }, [isMobile])

  useEffect(() => {
    if (!mobileFiltersOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileFiltersOpen])

  const filteredCandidates = useMemo(() => {
    const query = emailQuery.trim().toLowerCase()
    return candidates
      .filter((candidate) => (!statusFilter || candidate.status === statusFilter) && candidate.email.toLowerCase().includes(query))
      .sort((left, right) => sortOrder === 'newest'
        ? right.submittedAtValue - left.submittedAtValue
        : left.submittedAtValue - right.submittedAtValue)
  }, [candidates, emailQuery, sortOrder, statusFilter])
  const gridCandidates = filteredCandidates.slice((gridPage - 1) * GRID_PAGE_SIZE, gridPage * GRID_PAGE_SIZE)

  const summaryCards: { label: string; filter: StatusFilter; tag: string; count: number; icon: SummaryIconKind }[] = [
    { label: 'Total candidates', filter: '', tag: 'OPEN', count: candidates.length, icon: 'people' },
    { label: 'Completed', filter: 'Completed', tag: 'DONE', count: candidates.filter((candidate) => candidate.status === 'Completed').length, icon: 'complete' },
    { label: 'In progress', filter: 'In progress', tag: 'LIVE', count: candidates.filter((candidate) => candidate.status === 'In progress').length, icon: 'progress' },
    { label: 'Failed', filter: 'Failed', tag: 'FLAGGED', count: candidates.filter((candidate) => candidate.status === 'Failed').length, icon: 'failed' },
  ]

  const countForStatus = (status: StatusFilter) => candidates.filter((candidate) => !status || candidate.status === status).length

  return (
    <main className="content" id="main-content" tabIndex={-1}>
      <header className="page-heading">
        <div>
          <div className="eyebrow">CAMPAIGN OVERVIEW</div>
          <h1>Candidate assessments</h1>
          <p>Review interview sessions and verification results across your hiring campaign.</p>
        </div>
      </header>

      <section aria-label="Campaign totals" className="stats">
        {summaryCards.map((card) => (
          <Button
            aria-pressed={statusFilter === card.filter}
            className="stat"
            key={card.label}
            onClick={() => {
              setStatusFilter(card.filter)
              resetPagination()
            }}
            type="button"
          >
            <span className="stat-top">
              <span className="stat-label">{card.label}</span>
              <span className="stat-tag">{card.tag}</span>
            </span>
            <strong className="stat-count">{card.count}</strong>
            <SummaryIcon kind={card.icon} />
          </Button>
        ))}
      </section>

      <section className="card sessions">
        <div className="section-heading">
          <div>
            <h2>Assessment sessions <span className="count">{filteredCandidates.length}</span></h2>
            <p>Select a candidate to review their interview evidence.</p>
          </div>
        </div>

        <div className="desktop-filter-controls">
          <CampaignFilterControls
            campaignId={campaignId}
            countForStatus={countForStatus}
            emailQuery={emailQuery}
            layout={layout}
            onEmailChange={(value) => { setEmailQuery(value); resetPagination() }}
            onLayoutChange={setLayout}
            onSortChange={(value) => { setSortOrder(value); resetPagination() }}
            onStatusChange={(value) => { setStatusFilter(value); resetPagination() }}
            sortOrder={sortOrder}
            statusFilter={statusFilter}
          />
        </div>
        <div className="mobile-filter-launch">
          <label className="search mobile-inline-search">
            <Input
              aria-label="Search candidate email"
              autoComplete="off"
              onChange={(event) => { setEmailQuery(event.target.value); resetPagination() }}
              placeholder="Search candidate email…"
              type="search"
              value={emailQuery}
            />
            <span aria-hidden="true"><Search strokeWidth={1.7} /></span>
          </label>
          <Button aria-label="Open filters" className="mobile-filter-trigger" onClick={() => setMobileFiltersOpen(true)} type="button" variant="outline">
            <Filter aria-hidden="true" size={17} />Filters
          </Button>
        </div>
        {mobileFiltersOpen && (
          <div className="mobile-filter-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileFiltersOpen(false) }}>
            <section aria-labelledby="mobile-filter-title" aria-modal="true" className="mobile-filter-sheet" role="dialog">
              <header className="mobile-filter-header">
                <div><h2 id="mobile-filter-title">Campaign filters</h2><p>Choose a campaign and sort order.</p></div>
                <Button aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} size="icon" type="button" variant="ghost"><X aria-hidden="true" size={20} /></Button>
              </header>
              <CampaignFilterControls
                campaignId={campaignId}
                countForStatus={countForStatus}
                emailQuery={emailQuery}
                layout={layout}
                onEmailChange={(value) => { setEmailQuery(value); resetPagination() }}
                onLayoutChange={setLayout}
                onSortChange={(value) => { setSortOrder(value); resetPagination() }}
                onStatusChange={(value) => { setStatusFilter(value); resetPagination() }}
                showLayout={false}
                showSearch={false}
                showStatus={false}
                sortOrder={sortOrder}
                statusFilter={statusFilter}
              />
              <Button className="mobile-filter-apply" onClick={() => setMobileFiltersOpen(false)} type="button">Show candidates</Button>
            </section>
          </div>
        )}
        <div className="mobile-status-filters">
          <CampaignStatusFilter
            className="mobile-status-filter-root"
            countForStatus={countForStatus}
            onStatusChange={(value) => { setStatusFilter(value); resetPagination() }}
            statusFilter={statusFilter}
          />
        </div>

        <div aria-live="polite" className="campaign-results" id="results">
          {jobsQuery.isPending ? (
            <div className="notice"><InlineLoader label="Loading campaign jobs…" /></div>
          ) : jobsQuery.isError ? (
            <div className="notice" role="alert">
              <h3>Unable to load campaign jobs</h3>
              <p>{jobsQuery.error.message}</p>
              <Button onClick={() => void jobsQuery.refetch()} type="button" variant="outline">Try again</Button>
            </div>
          ) : jobsQuery.data.length === 0 ? (
            <NoAssessmentSessions campaignId={campaignId} />
          ) : filteredCandidates.length === 0 ? (
            <div className="notice"><h3>No matching candidates</h3><p>Try another email or choose a different status.</p></div>
          ) : layout === 'table' && !isMobile ? (
            <AssessmentTable
              onRowsPerPageChange={setPageSize}
              paginationResetDefaultPage={paginationReset}
              rows={filteredCandidates}
              rowsPerPage={pageSize}
            />
          ) : (
            <>
              <CandidateGrid campaignId={campaignId} rows={gridCandidates} />
              <GridPagination currentPage={gridPage} onChangePage={setGridPage} rowCount={filteredCandidates.length} />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
