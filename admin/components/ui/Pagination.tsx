interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

/**
 * Reusable Pagination Component
 * Consistent pagination across admin panel
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to show
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show pages around current
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && !onLimitChange) return null;

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 px-4 border-top">
      {/* Items per page */}
      {onLimitChange && (
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Show</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-muted">entries</span>
        </div>
      )}

      {/* Page info */}
      <div className="text-muted">
        Showing {startItem} to {endItem} of {total} entries
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination pagination-sm mb-0">
            {/* Previous */}
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <i className="ti ti-chevron-left"></i>
              </button>
            </li>

            {/* Page numbers */}
            {getPageNumbers().map((pageNum, index) => (
              <li
                key={index}
                className={`page-item ${pageNum === page ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}
              >
                {pageNum === '...' ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(pageNum as number)}
                  >
                    {pageNum}
                  </button>
                )}
              </li>
            ))}

            {/* Next */}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                <i className="ti ti-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
