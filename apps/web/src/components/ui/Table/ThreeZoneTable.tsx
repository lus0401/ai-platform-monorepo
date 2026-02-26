"use client";

import type { ReactNode, CSSProperties } from "react";
import { useMemo } from "react";
import styles from "./ThreeZoneTable.module.scss";
import Pagination, { PaginationProps } from "../Pagination";
// import roundInfo from "@assets/images/icon-round-info.png";

// 컬럼 정의
export interface ThreeZoneColumnInfo {
  column_key: string;
  label_name: string;
  input_type: string;
  group_key: string;
  group_label: string;
  unit: string | null;
  position: "left" | "center" | "right";
  is_bold: boolean;
  is_click: "graph" | "table" | "detail" | null;
  threshold?: number;
}

export interface ThreeZoneTableProps<T = any> {
  columns: ThreeZoneColumnInfo[];
  data: T[];
  emptyMessage?: string | ReactNode;
  minHeight?: number | string;
  className?: string;
  pagination?: PaginationProps;
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (row: T, columnKey: string, value: any) => void;
  selectedRowKey?: string | number | null;
  rowKeyField?: keyof T;
  titleRow?: string;
}

function ThreeZoneTable<T = any>({
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
}: ThreeZoneTableProps<T>) {
  // 컬럼 그룹 분리
  const leftColumns = useMemo(
    () => columns.filter((col) => col.position === "left"),
    [columns]
  );
  const centerColumns = useMemo(
    () => columns.filter((col) => col.position === "center"),
    [columns]
  );
  const rightColumns = useMemo(
    () => columns.filter((col) => col.position === "right"),
    [columns]
  );

  // 그룹 라벨
  const leftGroupLabel = leftColumns[0]?.group_label || "";
  const centerGroupLabel = centerColumns[0]?.group_label || "";
  const rightGroupLabel = rightColumns[0]?.group_label || "";

  // 컬럼 width 설정
  const COL_WIDTH = {
    left: 200,
    center: 120,
    right: 130,
  };

  // 왼쪽/오른쪽 섹션 총 width
  const leftTotalWidth = leftColumns.length * COL_WIDTH.left;
  const rightTotalWidth = rightColumns.length * COL_WIDTH.right;

  // sticky 스타일 계산
  const getStickyStyle = (
    col: ThreeZoneColumnInfo,
    colIndex: number,
    isHeader: boolean = false
  ): CSSProperties => {
    if (col.position === "left") {
      // 왼쪽 고정
      const leftOffset = leftColumns
        .slice(0, leftColumns.indexOf(col))
        .reduce((acc) => acc + COL_WIDTH.left, 0);

      return {
        position: "sticky",
        left: leftOffset,
        zIndex: isHeader ? 4 : 2,
        backgroundColor: isHeader ? "var(--neutrals-50)" : "#ffffff",
      };
    }

    if (col.position === "right") {
      // 오른쪽 고정 (역순 계산)
      const rightIndex = rightColumns.indexOf(col);
      const rightOffset = rightColumns
        .slice(rightIndex + 1)
        .reduce((acc) => acc + COL_WIDTH.right, 0);

      return {
        position: "sticky",
        right: rightOffset,
        zIndex: isHeader ? 4 : 2,
        backgroundColor: isHeader ? "var(--neutrals-50)" : "#ffffff",
      };
    }

    return {};
  };

  // 유틸리티 함수들
  const getCellValue = (row: T, columnKey: string) => (row as any)[columnKey];

  const extractPercentValue = (value: any): number | null => {
    if (value === null || value === undefined || value === "-") return null;
    const match = String(value).match(/^([\d.]+)%?$/);
    return match ? parseFloat(match[1]) : null;
  };

  const hasLowResultInRow = (row: T): boolean => {
    return columns
      .filter((col) => col.threshold !== undefined)
      .some((col) => {
        const numValue = extractPercentValue(getCellValue(row, col.column_key));
        return numValue !== null && numValue < col.threshold!;
      });
  };

  const formatValue = (
    value: any,
    col: ThreeZoneColumnInfo,
    row?: T
  ): ReactNode => {
    if (col.input_type === "button") {
      return (
        <button className={styles.infoButton}>
          <img src="/images/icon-round-info.png" alt="info" width={25} height={25} />
        </button>
      );
    }

    if (value === null || value === undefined || value === "") return "-";

    let formattedValue: string;
    if (col.input_type.startsWith("float")) {
      const decimals = Math.min(
        parseInt(col.input_type.split(".")[1] || "2"),
        3
      );
      const numValue =
        typeof value === "number" ? value : parseFloat(String(value));
      formattedValue = !isNaN(numValue)
        ? numValue.toFixed(decimals)
        : String(value);
    } else {
      formattedValue = String(value);
    }

    // 빨간색 조건 체크
    let shouldBeRed = false;
    if (col.threshold !== undefined) {
      const numValue = extractPercentValue(value);
      if (numValue !== null && numValue < col.threshold) shouldBeRed = true;
    }
    if (col.column_key === "lot" && row && hasLowResultInRow(row)) {
      shouldBeRed = true;
    }
    if (
      col.column_key === "predict_discharge" &&
      (row as any)?.isChargeWarning
    ) {
      shouldBeRed = true;
    }

    const displayValue = col.unit
      ? `${formattedValue}${col.unit}`
      : formattedValue;

    return (
      <span style={shouldBeRed ? { color: "#EA5455" } : undefined}>
        {displayValue}
      </span>
    );
  };

  const isRowSelected = (row: T, rowIndex: number) => {
    const rowKey = rowKeyField ? row[rowKeyField] : rowIndex;
    return selectedRowKey !== undefined && rowKey === selectedRowKey;
  };

  // 모든 컬럼 순서대로 합치기
  const allColumns = [...leftColumns, ...centerColumns, ...rightColumns];

  // 영역 경계 border 클래스 결정
  const getBorderClass = (col: ThreeZoneColumnInfo): string => {
    // 왼쪽 영역 마지막 컬럼
    if (
      col.position === "left" &&
      leftColumns[leftColumns.length - 1] === col
    ) {
      return styles.leftLastCell;
    }
    // 오른쪽 영역 첫 번째 컬럼
    if (col.position === "right" && rightColumns[0] === col) {
      return styles.rightFirstCell;
    }
    return "";
  };

  return (
    <div className={`${styles.tableContainer} ${className || ""}`}>
      {/* 타이틀 행 */}
      {titleRow && (
        <div className={styles.titleRow}>
          <span>{titleRow}</span>
        </div>
      )}

      {/* 그룹 헤더 바 (테이블 외부 - 스크롤되지 않음) */}
      <div className={styles.groupHeaderBar}>
        {leftColumns.length > 0 && (
          <div
            className={`${styles.groupHeaderCell} ${styles.leftGroupHeader}`}
            style={{ width: leftTotalWidth, minWidth: leftTotalWidth }}
          >
            {leftGroupLabel}
          </div>
        )}
        {centerColumns.length > 0 && (
          <div
            className={`${styles.groupHeaderCell} ${styles.centerGroupHeader}`}
          >
            {centerGroupLabel}
          </div>
        )}
        {rightColumns.length > 0 && (
          <div
            className={`${styles.groupHeaderCell} ${styles.rightGroupHeader}`}
            style={{ width: rightTotalWidth, minWidth: rightTotalWidth }}
          >
            {rightGroupLabel}
          </div>
        )}
      </div>

      {/* 테이블 래퍼 */}
      <div
        className={styles.tableWrapper}
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
      >
        <table className={styles.table}>
          <thead>
            {/* 컬럼 헤더 */}
            <tr className={styles.columnHeaderRow}>
              {allColumns.map((col, colIndex) => {
                const width =
                  col.position === "left"
                    ? COL_WIDTH.left
                    : col.position === "right"
                    ? COL_WIDTH.right
                    : COL_WIDTH.center;

                return (
                  <th
                    key={`${col.column_key}-header`}
                    className={`${styles.headerCell} ${
                      col.position !== "center" ? styles.stickyHeader : ""
                    } ${getBorderClass(col)}`}
                    style={{
                      width,
                      minWidth: width,
                      maxWidth: width,
                      ...getStickyStyle(col, colIndex, true),
                    }}
                  >
                    {col.label_name}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* 데이터 */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = isRowSelected(row, rowIndex);
                return (
                  <tr
                    key={`${rowIndex}-row`}
                    className={isSelected ? styles.selectedRow : ""}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    style={{ cursor: onRowClick ? "pointer" : undefined }}
                  >
                    {allColumns.map((col, colIndex) => {
                      const value = getCellValue(row, col.column_key);
                      const width =
                        col.position === "left"
                          ? COL_WIDTH.left
                          : col.position === "right"
                          ? COL_WIDTH.right
                          : COL_WIDTH.center;

                      return (
                        <td
                          key={`${col.column_key}-${rowIndex}`}
                          className={`${styles.dataCell} ${
                            col.position !== "center" ? styles.stickyCell : ""
                          } ${
                            isSelected ? styles.stickySelected : ""
                          } ${getBorderClass(col)}`}
                          style={{
                            width,
                            minWidth: width,
                            maxWidth: width,
                            fontWeight:
                              col.position === "right" ? 600 : undefined,
                            ...getStickyStyle(col, colIndex, false),
                          }}
                          onClick={(e) => {
                            if (onCellClick && col.is_click) {
                              e.stopPropagation();
                              onCellClick(row, col.column_key, value);
                            }
                          }}
                        >
                          {formatValue(value, col, row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export default ThreeZoneTable;
