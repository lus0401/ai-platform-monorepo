import styles from "./Progress.module.scss";

export interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  width?: "full" | "half" | "third" | "quarter";
  className?: string;
}

const Progress = ({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  label,
  width = "full",
  className,
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const wrapperClasses = [
    styles.progressWrapper,
    styles[`progressWrapper--${width}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const barClasses = [
    styles.progressBar,
    styles[`progressBar--${size}`],
    styles[`progressBar--${variant}`],
  ]
    .filter(Boolean)
    .join(" ");

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={wrapperClasses}>
      {showLabel && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>{displayLabel}</span>
        </div>
      )}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={barClasses} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default Progress;
