import { forwardRef } from "react";
import type { ReactNode } from "react";
import styles from "./Card.module.scss";

export interface CardProps {
  title?: string;
  children: ReactNode;
  headerAction?: ReactNode; // 헤더 우측 액션 버튼 등
  footer?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean; // border 표시 여부
  hoverable?: boolean; // hover 효과
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      children,
      headerAction,
      footer,
      className,
      padding = "md",
      bordered = true,
      hoverable = false,
      onClick,
    },
    ref
  ) => {
    const cardClasses = [
      styles.card,
      styles[`card--padding-${padding}`],
      bordered && styles["card--bordered"],
      hoverable && styles["card--hoverable"],
      onClick && styles["card--clickable"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cardClasses} onClick={onClick}>
        {(title || headerAction) && (
          <div className={styles.cardHeader}>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            {headerAction && (
              <div className={styles.cardHeaderAction}>{headerAction}</div>
            )}
          </div>
        )}

        <div className={styles.cardBody}>{children}</div>

        {footer && <div className={styles.cardFooter}>{footer}</div>}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

