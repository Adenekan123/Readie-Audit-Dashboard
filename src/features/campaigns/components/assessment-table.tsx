import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import DataTable, { type PaginationComponentProps, type TableColumn, type TableStyles } from 'react-data-table-component'
import { Link, useNavigate } from 'react-router-dom'

import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CandidateSession } from '@/shared/types/candidate'
import { getRoomPath } from '@/shared/lib/campaign-routing'

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

export function AssessmentTable({
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
