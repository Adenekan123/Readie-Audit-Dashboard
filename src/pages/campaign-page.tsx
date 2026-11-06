import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Copy, FileText, Filter, LayoutGrid, Mail, Search, ShieldAlert, ShieldCheck, Table2, UsersRound } from 'lucide-react'
import DataTable, { type PaginationComponentProps, type TableColumn, type TableStyles } from 'react-data-table-component'
import { Link, useNavigate } from 'react-router-dom'

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { campaignIds, campaigns, getCandidates, getRoomPath, type CandidateSession, type CandidateStatus, type CampaignId } from '@/lib/demo-data'

type StatusFilter = CandidateStatus | ''
type AssessmentLayout = 'grid' | 'table'
type SortOrder = 'newest' | 'oldest'
const GRID_PAGE_SIZE = 6

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

const assessmentTableStyles: TableStyles = {
  table: { style: { backgroundColor: 'transparent', color: '#454052' } },
  tableWrapper: { style: { overflow: 'visible' } },
  responsiveWrapper: { style: { overflowX: 'auto' } },
  headRow: {
    style: {
      minHeight: '54px',
      backgroundColor: '#f6f4f9',
      borderTop: '1px solid #dedbe5',
      borderBottom: '1px solid #dedbe5',
    },
  },
  headCells: {
    style: {
      paddingLeft: '14px',
      paddingRight: '14px',
      color: '#504a5b',
      fontSize: '13px',
      fontWeight: 700,
    },
  },
  rows: {
    style: {
      minHeight: '62px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #ebe8f0',
      color: '#454052',
      fontSize: '13px',
    },
    highlightOnHoverStyle: { backgroundColor: '#f8f6fb', outline: 'none' },
  },
  cells: { style: { paddingTop: '9px', paddingBottom: '9px', paddingLeft: '14px', paddingRight: '14px' } },
  pagination: {
    style: {
      minHeight: '0',
      padding: '0',
      borderTop: '0',
      color: '#625b6e',
      fontSize: '12px',
    },
  },
}

function AssessmentPagination({
  currentPage,
  onChangePage,
  onChangeRowsPerPage,
  paginationRowsPerPageOptions = [5, 10, 20],
  rowCount,
  rowsPerPage,
}: PaginationComponentProps) {
  const pageCount = Math.max(1, Math.ceil(rowCount / rowsPerPage))
  const firstRow = rowCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const lastRow = Math.min(currentPage * rowsPerPage, rowCount)

  return (
    <footer className="table-pagination">
      <div className="page-details">
        <span role="status">Showing {firstRow}–{lastRow} of {rowCount}</span>
        <div className="rows-per-page">
          <span>Rows per page</span>
          <Select value={String(rowsPerPage)} onValueChange={(value) => onChangeRowsPerPage(Number(value), currentPage)}>
            <SelectTrigger aria-label="Rows per page" className="page-size-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" avoidCollisions={false} className="dashboard-select-content" position="popper" side="bottom">
              {paginationRowsPerPageOptions.map((size) => <SelectItem className="dashboard-select-item" key={size} value={String(size)}>{size}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <nav aria-label="Table pagination">
        <Button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => onChangePage(currentPage - 1, rowCount)} type="button" variant="outline">
          <ChevronLeft aria-hidden="true" /><span>Previous</span>
        </Button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <Button aria-current={currentPage === pageNumber ? 'page' : undefined} aria-label={'Page ' + pageNumber} key={pageNumber} onClick={() => onChangePage(pageNumber, rowCount)} type="button" variant="outline">
            {pageNumber}
          </Button>
        ))}
        <Button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => onChangePage(currentPage + 1, rowCount)} type="button" variant="outline">
          <span>Next</span><ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </footer>
  )
}

function GridPagination({
  currentPage,
  onChangePage,
  rowCount,
}: {
  currentPage: number
  onChangePage: (page: number) => void
  rowCount: number
}) {
  const pageCount = Math.max(1, Math.ceil(rowCount / GRID_PAGE_SIZE))
  const firstCard = rowCount === 0 ? 0 : (currentPage - 1) * GRID_PAGE_SIZE + 1
  const lastCard = Math.min(currentPage * GRID_PAGE_SIZE, rowCount)

  return (
    <footer className="table-pagination grid-pagination">
      <div className="page-details">
        <span role="status">Showing {firstCard}–{lastCard} of {rowCount} candidates</span>
      </div>
      <nav aria-label="Grid pagination">
        <Button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => onChangePage(currentPage - 1)} type="button" variant="outline">
          <ChevronLeft aria-hidden="true" /><span>Previous</span>
        </Button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <Button aria-current={currentPage === pageNumber ? 'page' : undefined} aria-label={'Page ' + pageNumber} key={pageNumber} onClick={() => onChangePage(pageNumber)} type="button" variant="outline">
            {pageNumber}
          </Button>
        ))}
        <Button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => onChangePage(currentPage + 1)} type="button" variant="outline">
          <span>Next</span><ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </footer>
  )
}

function RoomIdentifierCell({ roomName }: { roomName: string }) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => {
    if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current)
  }, [])

  const copyRoomIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(roomName)
      setCopied(true)
      if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="room-identifier-cell">
      <code className="room-code" title={roomName}>{roomName}</code>
      <Button
        aria-label={copied ? 'Room identifier copied' : 'Copy room identifier'}
        className={`copy-room-id${copied ? ' is-copied' : ''}`}
        onClick={copyRoomIdentifier}
        size="icon-sm"
        title={copied ? 'Copied' : 'Copy room identifier'}
        type="button"
        variant="ghost"
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
    </div>
  )
}

function AssessmentTable({
  onRowsPerPageChange,
  paginationResetDefaultPage,
  rows,
  rowsPerPage,
}: {
  onRowsPerPageChange: (rowsPerPage: number) => void
  paginationResetDefaultPage: boolean
  rows: CandidateSession[]
  rowsPerPage: number
}) {
  const navigate = useNavigate()
  const columns = useMemo<TableColumn<CandidateSession>[]>(() => [
    {
      name: 'Candidate',
      minWidth: '210px',
      grow: 1.1,
      cell: (row) => (
        <Link className="person" to={getRoomPath(row.roomName)}>
          <span className="table-person-name">{row.name}</span>
        </Link>
      ),
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      minWidth: '220px',
      grow: 1.15,
      cell: (row) => <span className="table-email">{row.email}</span>,
    },
    {
      name: 'Room identifier',
      selector: (row) => row.roomName,
      minWidth: '220px',
      grow: 1.2,
      cell: (row) => <RoomIdentifierCell roomName={row.roomName} />,
    },
    {
      name: 'Submitted · WAT',
      selector: (row) => row.submittedAtValue,
      width: '200px',
      cell: (row) => <span className="date">{row.submittedAt}</span>,
    },
    {
      name: 'Status',
      width: '155px',
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      name: 'Assessment',
      width: '145px',
      cell: (row) => <Link aria-label={'Review ' + row.name + ' assessment'} className="table-review" to={getRoomPath(row.roomName, 'integrity')}>Review<ChevronRight aria-hidden="true" size={15} /></Link>,
    },
  ], [])

  return (
    <div className="table-wrap">
      <DataTable
        ariaLabel="Candidate assessment sessions"
        className="candidate-data-table"
        columns={columns}
        customStyles={assessmentTableStyles}
        data={rows}
        highlightOnHover
        keyField="roomName"
        onChangeRowsPerPage={(nextRowsPerPage) => onRowsPerPageChange(nextRowsPerPage)}
        onRowClicked={(row, event) => {
          if (event.target instanceof Element && event.target.closest('a,button')) return
          navigate(getRoomPath(row.roomName))
        }}
        pagination
        paginationComponent={AssessmentPagination}
        paginationComponentOptions={{ noRowsPerPage: false }}
        paginationDefaultPage={1}
        paginationPerPage={rowsPerPage}
        paginationResetDefaultPage={paginationResetDefaultPage}
        paginationRowsPerPageOptions={[5, 10, 20]}
        pointerOnHover
      />
    </div>
  )
}
function CandidateGrid({ rows, campaignId }: { rows: CandidateSession[]; campaignId: CampaignId }) {
  return (
    <div className="candidate-grid">
      {rows.map((row, index) => (
        <article className="candidate-card" data-status={row.status} key={row.roomName}>
          <header className="candidate-card-header">
            <div className="candidate-person">
              <span aria-hidden="true" className={`avatar avatar-${index % 4} candidate-avatar`}>{row.initials}</span>
              <div className="candidate-title">
                <h2>{row.name}</h2>
                <p className="candidate-email"><Mail aria-hidden="true" strokeWidth={1.7} />{row.email}</p>
              </div>
            </div>
            <StatusBadge value={row.status} />
          </header>
          <div className="candidate-card-meta">
            <span><UsersRound aria-hidden="true" strokeWidth={1.7} />Campaign {campaignId}</span>
            <span><CalendarDays aria-hidden="true" strokeWidth={1.7} />{row.submittedAt}</span>
            <span><Clock3 aria-hidden="true" strokeWidth={1.7} />Analysis {row.status === 'In progress' ? 'pending' : 'complete'}</span>
          </div>
          <div className="candidate-sections">
            <span className="candidate-section-label">Assessment sections</span>
            <div className="candidate-section-chips">
              <span><FileText aria-hidden="true" />Transcript</span>
              <span><ShieldAlert aria-hidden="true" />Integrity</span>
            </div>
          </div>
          <div className="candidate-actions">
            <Link to={getRoomPath(row.roomName)}>View transcript</Link>
            <Link className="primary" to={getRoomPath(row.roomName, 'integrity')}>Review assessment</Link>
          </div>
        </article>
      ))}
    </div>
  )
}

export function CampaignPage({ campaignId }: { campaignId: CampaignId }) {
  const navigate = useNavigate()
  const candidates = useMemo(() => getCandidates(campaignId), [campaignId])
  const [emailQuery, setEmailQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [layout, setLayout] = useState<AssessmentLayout>('table')
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

        <div className="toolbar">
          <label className="search">
            <Input
              aria-label="Search candidate email"
              autoComplete="off"
              className="search-input"
              onChange={(event) => {
                setEmailQuery(event.target.value)
                resetPagination()
              }}
              placeholder="Search candidate email…"
              type="search"
              value={emailQuery}
            />
            <span aria-hidden="true"><Search strokeWidth={1.7} /></span>
          </label>

          <div className="filter-control campaign-filter">
            <Filter aria-hidden="true" strokeWidth={1.7} />
            <Select value={campaignId} onValueChange={(value) => navigate(`/jobs/campaign/${value}`)}>
              <SelectTrigger aria-label="Hiring campaign" className="control-select-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" avoidCollisions={false} className="dashboard-select-content" position="popper" side="bottom">
                {campaignIds.map((id) => <SelectItem className="dashboard-select-item" key={id} value={id}>Campaign {id} · {campaigns[id]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-control sort-inline">
            <ArrowUpDown aria-hidden="true" strokeWidth={1.7} />
            <Select value={sortOrder} onValueChange={(value) => { setSortOrder(value as SortOrder); resetPagination() }}>
              <SelectTrigger aria-label="Sort assessments by submission date" className="control-select-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" avoidCollisions={false} className="dashboard-select-content" position="popper" side="bottom">
                <SelectItem className="dashboard-select-item" value="newest">Newest first</SelectItem>
                <SelectItem className="dashboard-select-item" value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div aria-label="Assessment layout" className="layout-switch" role="group">
            <Button aria-label="Grid view" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} type="button" variant="ghost">
              <LayoutGrid aria-hidden="true" />Grid
            </Button>
            <Button aria-label="Table view" aria-pressed={layout === 'table'} onClick={() => setLayout('table')} type="button" variant="ghost">
              <Table2 aria-hidden="true" />Table
            </Button>
          </div>
        </div>

        <Tabs
          className="status-filter-root"
          onValueChange={(value) => {
            setStatusFilter(value === 'all' ? '' : value as CandidateStatus)
            resetPagination()
          }}
          value={statusFilter || 'all'}
        >
          <TabsList aria-label="Filter assessments by status" className="status-tabs" variant="line">
            {statusOptions.map((option) => (
              <TabsTrigger className={`status-tab ${option.tone}`} key={option.label} value={option.value || 'all'}>
                <span aria-hidden="true" className="status-dot" />
                {option.label}
                <span className="status-tab-count">{countForStatus(option.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div aria-live="polite" id="results">
          {filteredCandidates.length === 0 ? (
            <div className="notice"><h3>No matching candidates</h3><p>Try another email or choose a different status.</p></div>
          ) : layout === 'table' ? (
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
