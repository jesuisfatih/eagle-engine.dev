'use client';

import { ReactNode } from 'react';

/**
 * Table Column Definition
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

/**
 * Reusable Table Component
 * Consistent table styling with sorting, selection, and loading states
 */
export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
}: TableProps<T>) {
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(row => String(row[keyField])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter(rid => rid !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            {/* Selection checkbox */}
            {onSelectionChange && (
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            
            {/* Column headers */}
            {columns.map(column => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={`${column.className || ''} ${column.sortable ? 'cursor-pointer' : ''}`}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                {column.header}
                {column.sortable && sortColumn === column.key && (
                  <i className={`ti ti-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Loading state */}
          {loading && (
            <tr>
              <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          )}
          
          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="text-center py-4 text-muted">
                <i className="ti ti-database-off me-2"></i>
                {emptyMessage}
              </td>
            </tr>
          )}
          
          {/* Data rows */}
          {!loading && data.map((row, index) => {
            const rowId = String(row[keyField]);
            const isSelected = selectedRows.includes(rowId);
            
            return (
              <tr
                key={rowId}
                className={`${isSelected ? 'table-active' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {/* Row selection checkbox */}
                {onSelectionChange && (
                  <td onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowId)}
                    />
                  </td>
                )}
                
                {/* Row cells */}
                {columns.map(column => (
                  <td key={column.key} className={column.className}>
                    {column.render
                      ? column.render(row, index)
                      : String(row[column.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
