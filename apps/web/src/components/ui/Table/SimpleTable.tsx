import type { ReactNode, CSSProperties } from "react";
import styles from "./SimpleTable.module.scss";
import Pagination, { PaginationProps } from "../Pagination";

export interface SimpleTableColumn<T = any> {
  key: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => any);
  render?: (value: any, row: T, index: number) => ReactNode;
  width?: string;
  sticky?: boolean; // 컬럼 고정 여부 (is_hold)
  stickyPosition?: "left" | "right"; // 고정 위치 (자동 계산됨)
}

// PaginationProps를 re-export
export type { PaginationProps };

export interface SimpleTableProps<T = any> {
  columns: SimpleTableColumn<T>[];
  data: T[];
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  rowSize?: "sm" | "md" | "lg"; // sm: 작은 행, md: 기본, lg: 큰 행
  emptyMessage?: string | ReactNode;
  minHeight?: number | string;
  className?: string;
  // 서버 사이드 페이지네이션
  pagination?: PaginationProps;
  // 행 클릭 및 선택 기능
  onRowClick?: (row: T, index: number) => void;
  // 셀 클릭 기능 (row, columnKey, value 전달)
  onCellClick?: (row: T, columnKey: string, value: any) => void;
  selectedRowKey?: string | number | null; // 선택된 행의 key 값
  rowKeyField?: keyof T; // 행 식별 필드 (기본: 'id')
}

function SimpleTable<T = any>({
  columns,
  data,
  striped = false,
  hoverable = true,
  bordered = true,
  compact = false,
  rowSize = "md",
  emptyMessage = "데이터가 없습니다",
  minHeight = 300,
  className,
  pagination,
  onRowClick,
  onCellClick,
  selectedRowKey,
  rowKeyField,
}: SimpleTableProps<T>) {
  const tableClasses = [
    styles.simpleTable,
    striped && styles["simpleTable--striped"],
    hoverable && styles["simpleTable--hoverable"],
    bordered && styles["simpleTable--bordered"],
    compact && styles["simpleTable--compact"],
    styles[`simpleTable--row-${rowSize}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getCellValue = (row: T, column: SimpleTableColumn<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === "function") {
        return column.accessor(row);
      }
      return row[column.accessor];
    }
    return null;
  };

  // sticky 컬럼들을 왼쪽/오른쪽 그룹으로 분류
  const getStickyInfo = () => {
    const stickyIndices = columns
      .map((col, idx) => (col.sticky ? idx : -1))
      .filter((idx) => idx !== -1);

    if (stickyIndices.length === 0)
      return { leftIndices: [], rightIndices: [] };

    // 첫 번째 non-sticky 컬럼 찾기
    const firstNonStickyIndex = columns.findIndex((col) => !col.sticky);
    // 마지막 non-sticky 컬럼 찾기
    let lastNonStickyIndex = -1;
    for (let i = columns.length - 1; i >= 0; i--) {
      if (!columns[i].sticky) {
        lastNonStickyIndex = i;
        break;
      }
    }

    // 왼쪽 고정: non-sticky 이전의 sticky 컬럼들
    const leftIndices = stickyIndices.filter(
      (idx) => idx < firstNonStickyIndex
    );
    // 오른쪽 고정: 마지막 non-sticky 이후의 sticky 컬럼들
    const rightIndices = stickyIndices.filter(
      (idx) => idx > lastNonStickyIndex
    );

    return { leftIndices, rightIndices };
  };

  const { leftIndices, rightIndices } = getStickyInfo();

  // 고정 컬럼의 위치 스타일 계산 (thead용, tbody용 분리)
  const getStickyStyles = (
    columnIndex: number,
    isHeader: boolean = false
  ): { styles: CSSProperties; position: "left" | "right" | null } => {
    const column = columns[columnIndex];
    if (!column.sticky) return { styles: {}, position: null };

    const isLeftSticky = leftIndices.includes(columnIndex);
    const isRightSticky = rightIndices.includes(columnIndex);

    // 기본 sticky 스타일 (배경색은 CSS에서 처리)
    const baseStyles: CSSProperties = {
      position: "sticky" as const,
      zIndex: isHeader ? 4 : 2, // 헤더는 더 높은 z-index
    };

    // 헤더일 경우 top: 0 추가 (세로 스크롤 시 고정)
    if (isHeader) {
      baseStyles.top = 0;
    }

    if (isLeftSticky) {
      // 왼쪽 고정: 이전 왼쪽 sticky 컬럼들의 width 합산
      let leftOffset = 0;
      for (const idx of leftIndices) {
        if (idx >= columnIndex) break;
        const width = columns[idx].width || "100px";
        leftOffset += parseInt(width) || 100;
      }

      return {
        styles: {
          ...baseStyles,
          left: `${leftOffset}px`,
        },
        position: "left",
      };
    }

    if (isRightSticky) {
      // 오른쪽 고정: 이후 오른쪽 sticky 컬럼들의 width 합산 (역순)
      let rightOffset = 0;
      for (let i = rightIndices.length - 1; i >= 0; i--) {
        const idx = rightIndices[i];
        if (idx <= columnIndex) break;
        const width = columns[idx].width || "100px";
        rightOffset += parseInt(width) || 100;
      }

      return {
        styles: {
          ...baseStyles,
          right: `${rightOffset}px`,
        },
        position: "right",
      };
    }

    return { styles: {}, position: null };
  };

  return (
    <div className={styles.tableContainer}>
      <div
        className={styles.tableWrapper}
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
      >
        <table className={tableClasses}>
          <thead>
            <tr>
              {columns.map((column, colIndex) => {
                const { styles: stickyStyles, position } = getStickyStyles(
                  colIndex,
                  true
                ); // 헤더용
                const stickyClass = position
                  ? `${styles.stickyCell} ${
                      styles[`stickyCell--${position}`]
                    } ${styles.stickyHeader}`
                  : "";
                // sticky 컬럼은 min-width/max-width로 너비 고정
                const widthStyles =
                  column.sticky && column.width
                    ? {
                        width: column.width,
                        minWidth: column.width,
                        maxWidth: column.width,
                      }
                    : { width: column.width };
                return (
                  <th
                    key={column.key}
                    style={{ ...widthStyles, ...stickyStyles }}
                    className={stickyClass}
                  >
                    {column.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                // 행 선택 여부 확인
                const rowKey = rowKeyField ? row[rowKeyField] : rowIndex;
                const isSelected =
                  selectedRowKey !== undefined && rowKey === selectedRowKey;
                const rowClassName = isSelected ? styles.selectedRow : "";

                return (
                  <tr
                    key={rowIndex}
                    className={rowClassName}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    style={{ cursor: onRowClick ? "pointer" : undefined }}
                  >
                    {columns.map((column, colIndex) => {
                      const value = getCellValue(row, column);
                      const { styles: stickyStyles, position } =
                        getStickyStyles(colIndex, false);
                      // 선택된 행의 sticky 셀에 선택 클래스 추가
                      const stickyClass = position
                        ? `${styles.stickyCell} ${
                            styles[`stickyCell--${position}`]
                          }${isSelected ? ` ${styles.stickySelected}` : ""}`
                        : "";
                      // sticky 컬럼은 min-width/max-width로 너비 고정
                      const widthStyles =
                        column.sticky && column.width
                          ? { minWidth: column.width, maxWidth: column.width }
                          : {};
                      return (
                        <td
                          key={column.key}
                          style={{ ...widthStyles, ...stickyStyles }}
                          className={stickyClass}
                          onClick={(e) => {
                            if (onCellClick) {
                              e.stopPropagation(); // row 클릭 이벤트 방지
                              onCellClick(row, column.key, value);
                            }
                          }}
                        >
                          {column.render
                            ? column.render(value, row, rowIndex)
                            : value}
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

      {/* 서버 사이드 페이지네이션 */}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

export default SimpleTable;
