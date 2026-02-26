import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import styles from "./Pagination.module.scss";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) => {
  // 페이지 번호 생성
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("...");
    } else if (currentPage >= totalPages - 2) {
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages - 1; i++) {
        pages.push(i);
      }
    } else {
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className={`${styles.pagination} ${className || ""}`}>
      <div className={styles.paginationInfo}>
        <span>
          Page {currentPage} of {totalPages} ({totalItems} items)
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={styles.pageSizeSelect}
            name="pageSize"
          >
            {pageSizeOptions.map((size) => (
              <option key={`pageSize-${size}`} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.paginationButtons}>
        {/* 이전 페이지 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`${styles.pageButton} ${styles.navButton}`}
        >
          <IoIosArrowBack size={20} />
        </button>

        {/* 페이지 번호들 */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`${styles.pageButton} ${
              page === currentPage ? styles.active : ""
            } ${page === "..." ? styles.ellipsis : ""}`}
          >
            {page}
          </button>
        ))}

        {/* 다음 페이지 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`${styles.pageButton} ${styles.navButton}`}
        >
          <IoIosArrowForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
