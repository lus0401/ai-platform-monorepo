"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from "react-icons/md";
import styles from "./DataTable.module.scss";

export interface DataTableProps<T = any> {
  columns: ColumnDef<T, any>[];
  data: T[];
  enableSorting?: boolean;
  enableGlobalFilter?: boolean; // 전역 검색 기능
  globalFilterValue?: string; // 외부에서 제어하는 검색어
  onGlobalFilterChange?: (value: string) => void; // 검색어 변경 콜백
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string | ReactNode;
  minHeight?: number | string; // 최소 높이 (기본값: 400px)
  className?: string;
}

function DataTable<T = any>({
  columns,
  data,
  enableSorting = true,
  enableGlobalFilter = false,
  globalFilterValue,
  onGlobalFilterChange,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = "데이터가 없습니다",
  minHeight = 400,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: globalFilterValue,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const tableClasses = [styles.dataTable, className].filter(Boolean).join(" ");

  return (
    <div className={styles.dataTableContainer}>
      <div
        className={styles.tableWrapper}
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
      >
        <table className={tableClasses}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? styles.sortableHeader
                            : styles.header
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {enableSorting && header.column.getCanSort() && (
                          <span className={styles.sortIcon}>
                            {header.column.getIsSorted() === "asc" ? (
                              <MdArrowUpward size={16} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <MdArrowDownward size={16} />
                            ) : (
                              <MdUnfoldMore size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && data.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              / {table.getFilteredRowModel().rows.length}개
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className={styles.pageSizeSelect}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}개씩 보기
                </option>
              ))}
            </select>
          </div>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className={styles.pageButton}
            >
              ««
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={styles.pageButton}
            >
              ‹
            </button>
            <span className={styles.pageInfo}>
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={styles.pageButton}
            >
              ›
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className={styles.pageButton}
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
