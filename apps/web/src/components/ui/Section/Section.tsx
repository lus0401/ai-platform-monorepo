import { forwardRef } from "react";
import type { ReactNode } from "react";
import styles from "./Section.module.scss";

export interface SectionProps {
  title?: string;
  children: ReactNode;
  headerAction?: ReactNode; // 헤더 우측 액션 버튼 등
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  background?: "white" | "transparent"; // 배경색 옵션
  shadow?: boolean; // 그림자 효과
}

const Section = forwardRef<HTMLDivElement, SectionProps>(
  (
    {
      title,
      children,
      headerAction,
      className,
      padding = "lg",
      background = "white",
      shadow = true,
    },
    ref
  ) => {
    const sectionClasses = [
      styles.section,
      styles[`section--padding-${padding}`],
      styles[`section--bg-${background}`],
      shadow && styles["section--shadow"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <section ref={ref} className={sectionClasses}>
        {(title || headerAction) && (
          <div className={styles.sectionHeader}>
            {title && <h2 className={styles.sectionTitle}>{title}</h2>}
            {headerAction && (
              <div className={styles.sectionHeaderAction}>{headerAction}</div>
            )}
          </div>
        )}

        <div className={styles.sectionBody}>{children}</div>
      </section>
    );
  }
);

Section.displayName = "Section";

export default Section;

