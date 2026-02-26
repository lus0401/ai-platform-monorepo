"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import Button from "@/components/ui/Button/Button";

// 영향 인자 타입
export interface InfluenceFactor {
  name: string;
  value: number;
}

// 컴포넌트 Props
export interface InfluenceFactorsChartProps {
  // 데이터
  lot: string;
  targetLabel: string;
  decreaseFactors: InfluenceFactor[];
  increaseFactors: InfluenceFactor[];
  // 로딩 상태
  isLoading?: boolean;
  // 빈 상태 메시지
  emptyMessage?: string;
  // 차트 설정
  xAxisDomain?: [number, number];
  // 최적값 추천 버튼 클릭 핸들러 (optional - 전달시에만 버튼 표시)
  onOptimalValueClick?: (lot: string, targetLabel: string) => void;
}

function InfluenceFactorsChart({
  lot,
  targetLabel,
  decreaseFactors,
  increaseFactors,
  isLoading = false,
  emptyMessage = "데이터가 없습니다.",
  xAxisDomain = [-0.25, 0.25],
  onOptimalValueClick,
}: InfluenceFactorsChartProps) {
  // 차트 데이터 준비
  const decreaseChartData = useMemo(() => {
    return decreaseFactors.map((f) => ({
      name: f.name,
      value: f.value,
    }));
  }, [decreaseFactors]);

  const increaseChartData = useMemo(() => {
    return increaseFactors.map((f) => ({
      name: f.name,
      value: f.value,
    }));
  }, [increaseFactors]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        데이터를 불러오는 중...
      </div>
    );
  }

  // 데이터 없음
  if (decreaseFactors.length === 0 && increaseFactors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 모델 예측 영향 인자 표시 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-neutral-900">모델 예측 영향 인자</span>
          <span className="ml-3 text-sm font-bold text-gray-900 bg-neutral-100 p-2 rounded-sm">
            {lot} {targetLabel}
          </span>
        </div>

        {onOptimalValueClick && (
          <div className="mt-2">
            <Button
              text="최적값 추천"
              variant="filled"
              size="s"
              color="primary"
              clickFn={() => onOptimalValueClick(lot, targetLabel)}
            />
          </div>
        )}
      </div>

      {/* 차트 2개 가로 배치 */}
      <div className="flex-1 flex gap-6 min-h-[300px]">
        {/* 예측값을 낮춘 상위 5개 특성 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 my-5 text-center">
            예측값을 낮춘 상위 5개 특성
          </h3>
          <div className="flex-1 min-h-[250px] outline-none focus:outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={decreaseChartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={xAxisDomain}
                  tickFormatter={(v) => v.toFixed(2)}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "영향도",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip formatter={(v: number) => v.toFixed(3)} />
                <ReferenceLine x={0} stroke="#666" />
                <Bar dataKey="value" barSize={30}>
                  {decreaseChartData.map((entry, index) => (
                    <Cell
                      key={`decrease-cell-${index}`}
                      fill={entry.value < 0 ? "#5470c6" : "#EE6666"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 예측값을 높인 상위 5개 특성 */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 my-5 text-center">
            예측값을 높인 상위 5개 특성
          </h3>
          <div className="flex-1 min-h-[250px] outline-none focus:outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={increaseChartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={xAxisDomain}
                  tickFormatter={(v) => v.toFixed(2)}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "영향도",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip formatter={(v: number) => v.toFixed(3)} />
                <ReferenceLine x={0} stroke="#666" />
                <Bar dataKey="value" barSize={30}>
                  {increaseChartData.map((entry, index) => (
                    <Cell
                      key={`increase-cell-${index}`}
                      fill={entry.value > 0 ? "#EE6666" : "#5470c6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfluenceFactorsChart;
