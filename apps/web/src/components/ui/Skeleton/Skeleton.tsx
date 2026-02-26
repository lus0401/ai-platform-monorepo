import type { CSSProperties } from "react";
import styles from "./Skeleton.module.scss";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  className?: string;
  count?: number; // 여러 개를 반복해서 렌더링
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  animation = "pulse",
  className,
  count = 1,
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[`skeleton--${variant}`],
    animation !== "none" && styles[`skeleton--${animation}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (count === 1) {
    return <span className={skeletonClasses} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={skeletonClasses} style={style} />
      ))}
    </>
  );
};

export default Skeleton;
