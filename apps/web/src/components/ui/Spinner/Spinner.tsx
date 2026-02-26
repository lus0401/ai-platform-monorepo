import styles from "./Spinner.module.scss";

export interface SpinnerProps {
  variant?: "circular" | "dots" | "ring";
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white";
  label?: string; // 로딩 텍스트
  fullScreen?: boolean; // 전체 화면 오버레이
  className?: string;
}

const Spinner = ({
  variant = "circular",
  size = "md",
  color = "primary",
  label,
  fullScreen = false,
  className,
}: SpinnerProps) => {
  const spinnerClasses = [
    styles.spinner,
    styles[`spinner--${variant}`],
    styles[`spinner--${size}`],
    styles[`spinner--${color}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className={spinnerClasses}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        );
      case "ring":
        return (
          <div className={spinnerClasses}>
            <div className={styles.ring} />
          </div>
        );
      case "circular":
      default:
        return <div className={spinnerClasses} />;
    }
  };

  if (fullScreen) {
    return (
      <div className={styles.spinnerOverlay}>
        <div className={styles.spinnerContainer}>
          {renderSpinner()}
          {label && <p className={styles.spinnerLabel}>{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.spinnerWrapper}>
      {renderSpinner()}
      {label && <p className={styles.spinnerLabel}>{label}</p>}
    </div>
  );
};

export default Spinner;

