// 상태 타입
export type CircularProgressStatus =
  | "success"
  | "warning"
  | "error"
  | "default";

export interface CircularProgressProps {
  value: number; // 0~100
  status?: CircularProgressStatus;
  size?: number; // 전체 크기 (기본: 100)
  strokeWidth?: number; // 두께 (기본: 8)
  label?: string; // 중앙 상단 라벨 (예: "이상치 점수")
  showValue?: boolean; // 값 표시 여부 (기본: true)
  unit?: string; // 단위 (기본: "%")
  customColor?: string; // 커스텀 색상 (status 대신 직접 색상 지정)
}

// 상태별 색상
const STATUS_COLORS: Record<CircularProgressStatus, string> = {
  success: "#10B981", // emerald-500
  warning: "#FBBC55", // warning-500
  error: "#ea5455", // red-500
  default: "#3B82F6", // blue-500
};

const CircularProgress = ({
  value,
  status = "default",
  size = 100,
  strokeWidth = 17,
  label,
  showValue = true,
  unit = "%",
  customColor,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  // 프로그레스 바 색상 결정 (customColor 우선)
  const color = customColor || STATUS_COLORS[status];

  // 텍스트 색상: error일 때만 빨간색, 그 외는 neutral-900
  const textColor = status === "error" ? STATUS_COLORS.error : undefined;

  // 도넛 안쪽 반지름 (흰색 채움용)
  const innerRadius = radius - strokeWidth / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 도넛 안쪽 원 (error, warning일 때 흰색) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill={status === "error" || status === "warning" ? "white" : "none"}
        />
        {/* 배경 원 (회색 트랙) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D7DFE9"
          strokeWidth={strokeWidth}
        />
        {/* 프로그레스 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {/* 중앙 텍스트 */}
      {(label || showValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span className="text-2xs font-bold text-custom-neutral-900">
              {label}
            </span>
          )}
          {showValue && (
            <span
              className={`ml-1 text-3xl font-bold ${
                !textColor ? "text-custom-neutral-900" : ""
              }`}
              style={textColor ? { color: textColor } : undefined}
            >
              {value}
              <span className="text-sm">{unit}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
