import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FileText, Mail, ShieldAlert, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import type { CandidateSession, CampaignId } from '@/shared/types/candidate'
import { getRoomPath } from '@/shared/lib/campaign-routing'

export const GRID_PAGE_SIZE = 6

export function GridPagination({
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

export function CandidateGrid({ rows, campaignId }: { rows: CandidateSession[]; campaignId: CampaignId }) {
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
            <Link className="primary" to={getRoomPath(row.roomName, 'integrity')}>
              Review assessment<ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
