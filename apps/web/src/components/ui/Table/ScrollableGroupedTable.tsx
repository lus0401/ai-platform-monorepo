"use client";

import React, { ReactNode, useMemo } from "react";
import styles from "./ScrollableGroupedTable.module.scss";
import Pagination, { PaginationProps } from "../Pagination";

// 컬럼 정의
export interface ScrollableColumnInfo {
  column_key: string;
  label_name: string;
  input_type: string;
  group_key: string;
  group_label: string;
  unit: string | null;
  is_hold: boolean; // 왼쪽 고정 여부
  is_bold: boolean;
  is_click: "graph" | "table" | "detail" | null;
  threshold?: number; // 정상 범위 기준값 (이 값 미만이면 빨간 글씨)
}

// 그룹 정보
interface ColumnGroup {
  groupKey: string;
  groupLabel: string;
  columns: ScrollableColumnInfo[];
}

export interface ScrollableGroupedTableProps<T = any> {
  columns: ScrollableColumnInfo[];
  data: T[];
  emptyMessage?: string | ReactNode;
  minHeight?: number | string;
  className?: string;
  pagination?: PaginationProps;
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (row: T, columnKey: string, value: any) => void;
  selectedRowKey?: string | number | null;
  rowKeyField?: keyof T;
  titleRow?: string; // 최상단 타이틀 행
}

function ScrollableGroupedTable<T = any>({
  columns,
  data,
  emptyMessage = "데이터가 없습니다",
  minHeight = 300,
  className,
  pagination,
  onRowClick,
  onCellClick,
  selectedRowKey,
  rowKeyField,
  titleRow,
}: ScrollableGroupedTableProps<T>) {
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
        });
      }
    });

    return Array.from(groupMap.values());
  }, [scrollableColumns]);

  // 셀 값 가져오기
  const getCellValue = (row: T, columnKey: string) => {
    return (row as any)[columnKey];
  };

  // 퍼센트 값 추출 (예: "78.5%" -> 78.5)
  const extractPercentValue = (value: any): number | null => {
    if (value === null || value === undefined || value === "-") return null;
    const strValue = String(value);
    const match = strValue.match(/^([\d.]+)%?$/);
    if (match) {
      return parseFloat(match[1]);
    }
    return null;
  };

  // 행의 예측 결과 중 threshold 미만인 값이 있는지 확인
  const hasLowResultInRow = (row: T): boolean => {
    // threshold가 있는 컬럼들 확인
    const resultColumns = columns.filter((col) => col.threshold !== undefined);

    for (const col of resultColumns) {
      const value = getCellValue(row, col.column_key);
      const numValue = extractPercentValue(value);
      if (numValue !== null && numValue < col.threshold!) {
        return true;
      }
    }
    return false;
  };

  // 값 포맷팅
  const formatValue = (
    value: any,
    col: ScrollableColumnInfo,
    row?: T
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

    // threshold 체크 (예측 결과 컬럼)
    let isBelowThreshold = false;
    if (col.threshold !== undefined) {
      const numValue = extractPercentValue(value);
      if (numValue !== null && numValue < col.threshold) {
        isBelowThreshold = true;
      }
    }

    // LOT 컬럼인 경우, 해당 행의 예측 결과 중 하나라도 threshold 미만이면 빨간색
    const isLotColumn = col.column_key === "lot";
    const lotHasLowResult = isLotColumn && row ? hasLowResultInRow(row) : false;

    // 빨간색 스타일 적용 조건
    const shouldBeRed =
      (isActualColumn && isFailValue) || isBelowThreshold || lotHasLowResult;

    // unit 추가 (실제 결과 컬럼이 아닌 경우에만)
    const displayValue =
      col.unit && !isActualColumn
        ? `${formattedValue}${col.unit}`
        : formattedValue;

    return (
      <span style={shouldBeRed ? { color: "#EA5455" } : undefined}>
        {displayValue}
      </span>
    );
  };

  // 행 선택 여부 체크
  const isRowSelected = (row: T, rowIndex: number) => {
    const rowKey = rowKeyField ? row[rowKeyField] : rowIndex;
    return selectedRowKey !== undefined && rowKey === selectedRowKey;
  };

  return (
    <div className={`${styles.tableContainer} ${className || ""}`}>
      {/* 타이틀 행 (선택적) */}
      {titleRow && (
        <div className={styles.titleRow}>
          <span>{titleRow}</span>
        </div>
      )}

      {/* 그룹 헤더 바 */}
      <div className={styles.groupHeaderBar}>
        {/* Sticky 영역 그룹 헤더 */}
        <div className={styles.stickyGroupHeader}>
          {stickyColumns.length > 0 && stickyColumns[0].group_label
            ? stickyColumns[0].group_label
            : ""}
        </div>
        {/* 스크롤 그룹 헤더들 */}
        {scrollableGroups.map((group, idx) => (
          <div
            key={`${group.groupKey}-group-header`}
            className={`${styles.scrollableGroupHeader} ${
              idx < scrollableGroups.length - 1 ? styles.groupBorderRight : ""
            }`}
          >
            {group.groupLabel}
          </div>
        ))}
      </div>

      {/* 테이블 래퍼 - 열 기반 레이아웃 */}
      <div
        className={styles.tableWrapper}
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
      >
        {data.length === 0 ? (
          <div className={styles.emptyRow}>
            <div className={styles.emptyContent}>{emptyMessage}</div>
          </div>
        ) : (
          <div className={styles.columnsContainer}>
            {/* Sticky 열 (LOT 등) */}
            <div className={styles.stickyColumnGroup}>
              {/* 컬럼 헤더 */}
              <div className={styles.columnHeaders}>
                {stickyColumns.map((col) => (
                  <div
                    key={`${col.column_key}-header-cell`}
                    className={styles.headerStickyCell}
                  >
                    {col.label_name}
                  </div>
                ))}
              </div>
              {/* 데이터 셀들 */}
              <div className={styles.columnData}>
                {data.map((row, rowIndex) => {
                  const isSelected = isRowSelected(row, rowIndex);
                  return (
                    <div
                      key={`sticky-row-${rowIndex}`}
                      className={`${styles.dataRow} ${
                        isSelected ? styles.selectedRow : ""
                      }`}
                      onClick={() => onRowClick?.(row, rowIndex)}
                      style={{ cursor: onRowClick ? "pointer" : undefined }}
                    >
                      {stickyColumns.map((col) => {
                        const value = getCellValue(row, col.column_key);
                        return (
                          <div
                            key={col.column_key}
                            className={styles.dataCell}
                            onClick={(e) => {
                              if (onCellClick && col.is_click) {
                                e.stopPropagation();
                                onCellClick(row, col.column_key, value);
                              }
                            }}
                          >
                            {formatValue(value, col, row)}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 스크롤 가능한 그룹 열들 */}
            {scrollableGroups.map((group, groupIdx) => (
              <div
                key={`${group.groupKey}-group-content`}
                className={`${styles.scrollableColumnGroup} ${
                  groupIdx < scrollableGroups.length - 1
                    ? styles.groupBorderRight
                    : ""
                }`}
              >
                {/* 그룹 전체가 스크롤되는 컨테이너 */}
                <div className={styles.groupScrollWrapper}>
                  <div className={styles.groupScrollContent}>
                    {/* 컬럼 헤더 */}
                    <div className={styles.columnHeaders}>
                      {group.columns.map((col) => (
                        <div key={col.column_key} className={styles.headerCell}>
                          {col.label_name}
                        </div>
                      ))}
                    </div>
                    {/* 데이터 셀들 */}
                    <div className={styles.columnData}>
                      {data.map((row, rowIndex) => {
                        const isSelected = isRowSelected(row, rowIndex);
                        return (
                          <div
                            key={`${group.groupKey}-row-${rowIndex}`}
                            className={`${styles.dataRow} ${
                              isSelected ? styles.selectedRow : ""
                            }`}
                            onClick={() => onRowClick?.(row, rowIndex)}
                            style={{
                              cursor: onRowClick ? "pointer" : undefined,
                            }}
                          >
                            {group.columns.map((col) => {
                              const value = getCellValue(row, col.column_key);
                              return (
                                <div
                                  key={`${group.groupKey}-${col.column_key}-cell`}
                                  className={styles.dataCell}
                                  onClick={(e) => {
                                    if (onCellClick && col.is_click) {
                                      e.stopPropagation();
                                      onCellClick(row, col.column_key, value);
                                    }
                                  }}
                                  style={{
                                    cursor: col.is_click
                                      ? "pointer"
                                      : undefined,
                                  }}
                                >
                                  {formatValue(value, col, row)}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export default ScrollableGroupedTable;
