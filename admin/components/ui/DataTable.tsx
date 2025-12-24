'use client';

import React, { useState } from 'react';
import { Table, Pagination } from '@/components/ui';
import { SearchInput, SelectFilter, FilterBar } from '@/components/ui/PageLayout';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface StatusConfig {
  value: string;
  label: string;
  color?: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'secondary';
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  
  // Identification
  keyField?: string;
  
  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  statusFilter?: {
    options: StatusConfig[];
    field: string;
  };
  customFilters?: React.ReactNode;
  
  // Pagination
  paginate?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  
  // Selection
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  
  // Sorting
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  
  // Actions
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  
  // Empty state
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

/**
 * DataTable - Feature-rich data table with search, filter, pagination, and selection
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  keyField = 'id',
  searchable = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  statusFilter,
  customFilters,
  paginate = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  selectable = false,
  onSelectionChange,
  defaultSortKey,
  defaultSortOrder = 'asc',
  onRowClick,
  rowActions,
  bulkActions,
  emptyIcon = 'database',
  emptyTitle = 'No data found',
  emptyMessage = 'Try adjusting your search or filter criteria.',
}: DataTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState(defaultSortKey || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Filter data
  let filteredData = [...data];

  // Apply search filter
  if (searchQuery && searchFields.length > 0) {
    const query = searchQuery.toLowerCase();
    filteredData = filteredData.filter(row => 
      searchFields.some(field => {
        const value = row[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }

  // Apply status filter
  if (statusValue && statusFilter) {
    filteredData = filteredData.filter(row => 
      row[statusFilter.field] === statusValue
    );
  }

  // Apply sorting
  if (sortKey) {
    filteredData.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Apply pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  if (paginate) {
    const start = (currentPage - 1) * pageSize;
    filteredData = filteredData.slice(start, start + pageSize);
  }

  // Handle selection
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Build columns with actions
  const tableColumns = [...columns];
  if (rowActions) {
    tableColumns.push({
      key: '_actions',
      label: 'Actions',
      className: 'text-end',
      render: (row) => rowActions(row),
    });
  }

  // Has filters
  const hasFilters = searchable || statusFilter || customFilters;

  return (
    <div className="data-table">
      {/* Filter Bar */}
      {hasFilters && (
        <FilterBar className="mb-3">
          {searchable && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={searchPlaceholder}
            />
          )}
          
          {statusFilter && (
            <SelectFilter
              value={statusValue}
              onChange={setStatusValue}
              options={statusFilter.options.map(s => ({ value: s.value, label: s.label }))}
              placeholder="All Statuses"
            />
          )}
          
          {customFilters}
          
          {/* Bulk actions */}
          {selectable && selectedIds.length > 0 && bulkActions && (
            <div className="ms-auto d-flex gap-2 align-items-center">
              <span className="text-muted small">{selectedIds.length} selected</span>
              {bulkActions}
            </div>
          )}
        </FilterBar>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={tableColumns}
            data={filteredData}
            loading={loading}
            selectable={selectable}
            keyField={keyField}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={onRowClick}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
          />
        </div>

        {/* Pagination */}
        {paginate && totalPages > 1 && (
          <div className="card-footer">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={handlePageSizeChange}
              totalItems={totalItems}
              showPageSizeSelector
              showItemCount
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
