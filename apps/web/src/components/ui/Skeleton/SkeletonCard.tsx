import React from "react";
import Skeleton from "./Skeleton";
import styles from "./SkeletonCard.module.scss";

export interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: number;
  lines?: number; // 텍스트 라인 수
  animation?: "pulse" | "wave" | "none";
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageHeight = 200,
  lines = 3,
  animation = "pulse",
  className,
}) => {
  const cardClasses = [styles.skeletonCard, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className={styles.header}>
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          animation={animation}
        />
      </div>

      {/* Image */}
      {hasImage && (
        <div className={styles.image}>
          <Skeleton
            variant="rectangular"
            height={imageHeight}
            animation={animation}
          />
        </div>
      )}

      {/* Content Lines */}
      <div className={styles.content}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? "70%" : "100%"}
            animation={animation}
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
