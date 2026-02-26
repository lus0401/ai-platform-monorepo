"use client";

import React, { ReactNode, useMemo, useRef, useEffect, useState } from "react";
import styles from "./GroupedTable.module.scss";
import Pagination, { PaginationProps } from "../Pagination";

// 컬럼 정의 (ColumnInfo 기반)
export interface GroupedColumnInfo {
  column_key: string;
  label_name: string;
  input_type: string;
  group_key: string;
  group_label: string;
  unit: string | null;
  is_hold: boolean; // 왼쪽 고정 여부
  is_bold: boolean;
  is_click: "graph" | "table" | "detail" | null;
  is_collapsed?: boolean; // 그룹 축약 표시 여부
}

// 그룹 정보
interface ColumnGroup {
  groupKey: string;
  groupLabel: string;
  columns: GroupedColumnInfo[];
  isSticky: boolean; // 그룹 전체가 고정인지
  isCollapsed: boolean; // 축약 표시 여부
}

// PaginationProps를 re-export
export type { PaginationProps };

export interface GroupedTableProps<T = any> {
  columns: GroupedColumnInfo[];
  data: T[];
  emptyMessage?: string | ReactNode;
  minHeight?: number | string;
  className?: string;
  pagination?: PaginationProps;
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (row: T, columnKey: string, value: any) => void;
  onGroupClick?: (row: T, groupKey: string, groupLabel: string) => void; // 축약 그룹 클릭
  selectedRowKey?: string | number | null;
  rowKeyField?: keyof T;
  selectedGroupKey?: string | null; // 선택된 그룹
}

function GroupedTable<T = any>({
  columns,
  data,
  emptyMessage = "데이터가 없습니다",
  minHeight = 300,
  className,
  pagination,
  onRowClick,
  onCellClick,
  onGroupClick,
  selectedRowKey,
  rowKeyField,
  selectedGroupKey,
}: GroupedTableProps<T>) {
  // refs
  const stickyHeaderRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  // states
  const [stickyLeftOffsets, setStickyLeftOffsets] = useState<number[]>([]);
  const [stickyGroupWidths, setStickyGroupWidths] = useState<number[]>([]);

  // 고정 컬럼만 필터링 (왼쪽 영역)
  const stickyColumns = useMemo(
    () => columns.filter((col) => col.is_hold),
    [columns]
  );

  // 스크롤 컬럼만 필터링 (오른쪽 영역)
  const scrollableColumns = useMemo(
    () => columns.filter((col) => !col.is_hold),
    [columns]
  );

  // 고정 영역의 그룹들
  const stickyGroups = useMemo((): ColumnGroup[] => {
    const groupMap = new Map<string, ColumnGroup>();

    stickyColumns.forEach((col) => {
      const existing = groupMap.get(col.group_key);
      if (existing) {
        existing.columns.push(col);
      } else {
        groupMap.set(col.group_key, {
          groupKey: col.group_key,
          groupLabel: col.group_label,
          columns: [col],
          isSticky: true,
          isCollapsed: col.is_collapsed || false,
        });
      }
    });

    return Array.from(groupMap.values());
  }, [stickyColumns]);

  // 스크롤 영역의 그룹들
  const scrollableGroups = useMemo((): ColumnGroup[] => {
    const groupMap = new Map<string, ColumnGroup>();

    scrollableColumns.forEach((col) => {
      const existing = groupMap.get(col.group_key);
      if (existing) {
        existing.columns.push(col);
      } else {
        groupMap.set(col.group_key, {
          groupKey: col.group_key,
          groupLabel: col.group_label,
          columns: [col],
          isSticky: false,
          isCollapsed: col.is_collapsed || false,
        });
      }
    });

    return Array.from(groupMap.values());
  }, [scrollableColumns]);

  // 축약되지 않은 고정 컬럼만 (헤더/데이터 렌더링용)
  const visibleStickyColumns = useMemo(() => {
    return stickyColumns.filter((col) => !col.is_collapsed);
  }, [stickyColumns]);

  // 축약된 고정 그룹들 (각 그룹당 1개의 셀로 표시)
  const collapsedStickyGroups = useMemo(() => {
    return stickyGroups.filter((g) => g.isCollapsed);
  }, [stickyGroups]);

  // 축약되지 않은 그룹들 (그룹 헤더 표시용)
  const visibleStickyGroups = useMemo(() => {
    return stickyGroups.filter((g) => !g.isCollapsed);
  }, [stickyGroups]);

  // sticky 컬럼 헤더 너비 측정 및 left offset 계산
  useEffect(() => {
    const calculateOffsets = () => {
      const offsets: number[] = [];
      const groupWidths: number[] = [];
      let cumulativeOffset = 0;

      // visibleStickyColumns + collapsedStickyGroups 개수만큼 계산
      const totalStickyCount =
        visibleStickyColumns.length + collapsedStickyGroups.length;

      for (let idx = 0; idx < totalStickyCount; idx++) {
        offsets[idx] = cumulativeOffset;
        const ref = stickyHeaderRefs.current[idx];
        if (ref) {
          cumulativeOffset += ref.offsetWidth;
        }
      }

      // 각 그룹별 너비 계산
      let colIdx = 0;

      // 1. 축약되지 않은 그룹들의 너비 (해당 그룹에 속한 컬럼들의 너비 합)
      visibleStickyGroups.forEach((group) => {
        let groupWidth = 0;
        const groupCols = visibleStickyColumns.filter(
          (col) => col.group_key === group.groupKey
        );
        groupCols.forEach(() => {
          const ref = stickyHeaderRefs.current[colIdx];
          if (ref) {
            groupWidth += ref.offsetWidth;
          }
          colIdx++;
        });
        groupWidths.push(groupWidth);
      });

      // 2. 축약된 그룹들의 너비 (각 "..." 셀의 너비)
      collapsedStickyGroups.forEach((_, groupIdx) => {
        const cellIdx = visibleStickyColumns.length + groupIdx;
        const ref = stickyHeaderRefs.current[cellIdx];
        groupWidths.push(ref?.offsetWidth || 0);
      });

      setStickyLeftOffsets(offsets);
      setStickyGroupWidths(groupWidths);
    };

    calculateOffsets();

    window.addEventListener("resize", calculateOffsets);
    return () => window.removeEventListener("resize", calculateOffsets);
  }, [visibleStickyColumns, visibleStickyGroups, collapsedStickyGroups, data]);

  // 고정 영역 총 너비
  const stickyTotalWidth = useMemo(() => {
    const totalCount =
      visibleStickyColumns.length + collapsedStickyGroups.length;
    if (totalCount === 0 || stickyLeftOffsets.length === 0) return 0;
    const lastOffset = stickyLeftOffsets[totalCount - 1] || 0;
    const lastRef = stickyHeaderRefs.current[totalCount - 1];
    return lastOffset + (lastRef?.offsetWidth || 0);
  }, [
    stickyLeftOffsets,
    visibleStickyColumns.length,
    collapsedStickyGroups.length,
  ]);

  // 셀 값 가져오기
  const getCellValue = (row: T, columnKey: string) => {
    return (row as any)[columnKey];
  };

  // 값 포맷팅
  const formatValue = (
    value: any,
    col: GroupedColumnInfo
  ): string | ReactNode => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    let formattedValue: string;
    if (col.input_type.startsWith("float")) {
      const specifiedDecimals = parseInt(col.input_type.split(".")[1] || "2");
      const decimals = Math.min(specifiedDecimals, 3);
      const numValue =
        typeof value === "number" ? value : parseFloat(String(value));
      formattedValue = !isNaN(numValue)
        ? numValue.toFixed(decimals)
        : String(value);
    } else {
      formattedValue = String(value);
    }

    // 실제 결과 컬럼 스타일 (합격/불합격)
    const isActualColumn = col.column_key.endsWith("_actual");
    const isFailValue = value === "불합격" || value === "FAIL";

    // 불합격일 때 빨간색 클래스 적용
    const className =
      isActualColumn && isFailValue ? "text-custom-error-500" : "";

    // unit 추가 (실제 결과 컬럼이 아닌 경우에만)
    const displayValue =
      col.unit && !isActualColumn
        ? `${formattedValue}${col.unit}`
        : formattedValue;

    return <span className={className || undefined}>{displayValue}</span>;
  };

  // column_key에 따른 CSS 클래스 반환
  const getColumnClass = (columnKey: string): string => {
    const classMap: Record<string, string> = {
      lot: styles.colLot,
    };
    return classMap[columnKey] || "";
  };

  return (
    <div className={`${styles.tableContainer} ${className || ""}`}>
      {/* 그룹 헤더 - 테이블 밖에서 고정 */}
      <div className={styles.groupHeaderBar}>
        <div
          className={styles.groupHeaderFixed}
          style={{ width: stickyTotalWidth > 0 ? stickyTotalWidth : "auto" }}
        >
          {/* 축약되지 않은 그룹들 */}
          {visibleStickyGroups.map((group, idx) => (
            <span
              key={`${group.groupKey}-group-header`}
              style={{
                width: stickyGroupWidths[idx] || "auto",
                flex: "none",
              }}
            >
              {group.groupLabel}
            </span>
          ))}
          {/* 축약된 그룹들 */}
          {collapsedStickyGroups.map((group, idx) => {
            const widthIdx = visibleStickyGroups.length + idx;
            return (
              <span
                key={`${group.groupKey}-collapsed-group-header`}
                className={styles.collapsedGroupHeader}
                style={{
                  width: stickyGroupWidths[widthIdx] || "auto",
                  flex: "none",
                }}
              >
                {group.groupLabel}
              </span>
            );
          })}
        </div>
        <div className={styles.groupHeaderScrollable}>
          {scrollableGroups.map((group) => (
            <span key={group.groupKey}>{group.groupLabel}</span>
          ))}
        </div>
      </div>

      <div
        className={styles.tableWrapper}
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
      >
        <table className={styles.groupedTable}>
          <thead>
            {/* 컬럼 헤더 */}
            <tr className={styles.columnHeaderRow}>
              {/* 고정 컬럼 헤더 - 축약되지 않은 컬럼 */}
              {visibleStickyColumns.map((col, idx) => {
                const totalVisibleIdx = idx;
                const isLastVisible =
                  idx === visibleStickyColumns.length - 1 &&
                  collapsedStickyGroups.length === 0;
                const colClass = getColumnClass(col.column_key);
                const leftOffset = stickyLeftOffsets[totalVisibleIdx] || 0;

                return (
                  <th
                    key={col.column_key}
                    ref={(el) => {
                      stickyHeaderRefs.current[totalVisibleIdx] = el;
                    }}
                    className={`${styles.stickyCell} ${styles.stickyHeader} ${
                      styles.columnHeader
                    } ${
                      isLastVisible ? styles.stickyCellLast : ""
                    } ${colClass}`}
                    style={{ left: leftOffset }}
                  >
                    {col.label_name}
                  </th>
                );
              })}
              {/* 고정 컬럼 헤더 - 축약된 그룹 (각 그룹당 1개의 "..." 셀) */}
              {collapsedStickyGroups.map((group, groupIdx) => {
                const headerIdx = visibleStickyColumns.length + groupIdx;
                const isLastSticky =
                  groupIdx === collapsedStickyGroups.length - 1;
                const leftOffset = stickyLeftOffsets[headerIdx] || 0;
                const isGroupSelected = selectedGroupKey === group.groupKey;

                return (
                  <th
                    key={`${group.groupKey}-collapsed-header`}
                    ref={(el) => {
                      stickyHeaderRefs.current[headerIdx] = el;
                    }}
                    className={`${styles.stickyCell} ${styles.stickyHeader} ${
                      styles.columnHeader
                    } ${styles.collapsedHeader} ${
                      isLastSticky ? styles.stickyCellLast : ""
                    } ${isGroupSelected ? styles.collapsedSelected : ""}`}
                    style={{ left: leftOffset }}
                  >
                    ...
                  </th>
                );
              })}
              {/* 스크롤 컬럼 헤더 */}
              {scrollableColumns.map((col) => {
                return (
                  <th key={`${col.column_key}-header`}>{col.label_name}</th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0
              ? null
              : data.map((row, rowIndex) => {
                  const rowKey = rowKeyField ? row[rowKeyField] : rowIndex;
                  const isSelected =
                    selectedRowKey !== undefined && rowKey === selectedRowKey;
                  const rowClassName = isSelected ? styles.selectedRow : "";

                  return (
                    <tr
                      key={`${rowIndex}-row`}
                      className={rowClassName}
                      onClick={() => onRowClick?.(row, rowIndex)}
                      style={{ cursor: onRowClick ? "pointer" : undefined }}
                    >
                      {/* 고정 컬럼 데이터 - 축약되지 않은 컬럼 */}
                      {visibleStickyColumns.map((col, idx) => {
                        const value = getCellValue(row, col.column_key);
                        const isLastVisible =
                          idx === visibleStickyColumns.length - 1 &&
                          collapsedStickyGroups.length === 0;
                        const colClass = getColumnClass(col.column_key);
                        const leftOffset = stickyLeftOffsets[idx] || 0;

                        let stickyClass = isSelected
                          ? `${styles.stickyCell} ${styles.stickySelected}`
                          : styles.stickyCell;

                        if (isLastVisible) {
                          stickyClass += ` ${styles.stickyCellLast}`;
                        }

                        return (
                          <td
                            key={`${col.column_key}-cell`}
                            className={`${stickyClass} ${colClass}`}
                            style={{ left: leftOffset }}
                            onClick={(e) => {
                              if (onCellClick && col.is_click) {
                                e.stopPropagation();
                                onCellClick(row, col.column_key, value);
                              }
                            }}
                          >
                            {formatValue(value, col)}
                          </td>
                        );
                      })}
                      {/* 고정 컬럼 데이터 - 축약된 그룹 (각 그룹당 1개의 "..." 셀) */}
                      {collapsedStickyGroups.map((group, groupIdx) => {
                        const cellIdx = visibleStickyColumns.length + groupIdx;
                        const isLastSticky =
                          groupIdx === collapsedStickyGroups.length - 1;
                        const leftOffset = stickyLeftOffsets[cellIdx] || 0;
                        const isGroupSelected =
                          selectedGroupKey === group.groupKey && isSelected;

                        let stickyClass = isSelected
                          ? `${styles.stickyCell} ${styles.stickySelected}`
                          : styles.stickyCell;

                        if (isLastSticky) {
                          stickyClass += ` ${styles.stickyCellLast}`;
                        }

                        return (
                          <td
                            key={`${group.groupKey}-collapsed-cell`}
                            className={`${stickyClass} ${
                              styles.collapsedCell
                            } ${
                              isGroupSelected
                                ? styles.collapsedCellSelected
                                : ""
                            }`}
                            style={{ left: leftOffset, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onGroupClick?.(
                                row,
                                group.groupKey,
                                group.groupLabel
                              );
                            }}
                          >
                            ...
                          </td>
                        );
                      })}
                      {/* 스크롤 컬럼 데이터 */}
                      {scrollableColumns.map((col) => {
                        const value = getCellValue(row, col.column_key);

                        return (
                          <td
                            key={`${col.column_key}-cell`}
                            onClick={(e) => {
                              if (onCellClick && col.is_click) {
                                e.stopPropagation();
                                onCellClick(row, col.column_key, value);
                              }
                            }}
                          >
                            {formatValue(value, col)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {/* Empty State - 화면 중앙에 표시 */}
        {data.length === 0 && (
          <div className={styles.emptyOverlay}>
            <div className={styles.emptyContent}>{emptyMessage}</div>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export default GroupedTable;
