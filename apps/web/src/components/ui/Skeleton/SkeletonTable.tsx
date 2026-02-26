import React from "react";
import Skeleton from "./Skeleton";
import styles from "./SkeletonTable.module.scss";

export interface SkeletonTableProps {
  rows?: number; // 행 개수
  columns?: number; // 열 개수
  hasHeader?: boolean; // 헤더 표시 여부
  animation?: "pulse" | "wave" | "none";
  className?: string;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  animation = "pulse",
  className,
}) => {
  const tableClasses = [styles.skeletonTable, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={tableClasses}>
      <table className={styles.table}>
        {hasHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index}>
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={16}
                    animation={animation}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={14}
                    animation={animation}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
