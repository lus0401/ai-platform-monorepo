"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Treemap, Cell,
} from "recharts";
import {
  equipmentImageCounts, defectTop10, treemapData, mockImages,
} from "@/lib/mockData";

// ── 타입 ─────────────────────────────────────────────
type Image = typeof mockImages[number];

// ── 서브 컴포넌트: 상태 배지 ─────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  const colors: Record<string, string> = {
    green:  "background:#dcfce7;color:#166534;",
    red:    "background:#fee2e2;color:#991b1b;",
    yellow: "background:#fef9c3;color:#854d0e;",
    blue:   "background:#dbeafe;color:#1e40af;",
  };
  return (
    <span
      style={{ ...(Object.fromEntries((colors[color] ?? colors.blue).split(";").filter(Boolean).map(s => s.split(":")))) as React.CSSProperties, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}
    >
      {text}
    </span>
  );
}

// ── 서브 컴포넌트: 이미지 카드 ───────────────────────
function ImageCard({ img, onSelect }: { img: Image; onSelect: (img: Image) => void }) {
  return (
    <div
      onClick={() => onSelect(img)}
      style={{
        border: img.isFlagged ? "2px solid #ef4444" : "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* 이미지 영역 — Dummy 색상 블록 */}
      <div style={{ height: 100, background: img.color, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 11, opacity: 0.8 }}>300×300</span>
        {img.isFlagged && (
          <span style={{ position: "absolute", top: 6, right: 6, background: "#ef4444", color: "#fff", borderRadius: 4, fontSize: 10, padding: "1px 5px" }}>
            🚩 FLAG
          </span>
        )}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.fileName}</p>
        <Badge text={img.label} color="blue" />
      </div>
    </div>
  );
}

// ── 서브 컴포넌트: 분류 변경 모달 ────────────────────
function LabelModal({ img, onClose }: { img: Image; onClose: () => void }) {
  const [defect, setDefect] = useState(img.defect);
  const defectOptions = ["AuNiCu도금", "솔더팅형", "과형", "넘침", "함몰", "이물질", "크랙", "SMPeeloff", "부유이물", "패턴불량"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 420, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f4e79" }}>이미지 상세 / 분류 변경</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#6b7280" }}>✕</button>
        </div>

        {/* 이미지 미리보기 */}
        <div style={{ height: 140, background: img.color, borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 13 }}>300 × 300 px</span>
        </div>

        {/* 메타정보 */}
        <table style={{ width: "100%", fontSize: 13, marginBottom: 18, borderCollapse: "collapse" }}>
          {[
            ["파일명", img.fileName],
            ["영역코드", img.area],
            ["현재 분류", img.defect],
            ["날짜", img.date],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: "#6b7280", paddingBottom: 6, width: 80 }}>{k}</td>
              <td style={{ fontWeight: 500, paddingBottom: 6 }}>{v}</td>
            </tr>
          ))}
        </table>

        {/* 분류 변경 */}
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>분류 변경</label>
        <select
          value={defect}
          onChange={e => setDefect(e.target.value)}
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, marginBottom: 16 }}
        >
          {defectOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { alert(`분류 변경 완료: ${img.defect} → ${defect}`); onClose(); }}
            style={{ flex: 1, padding: "9px 0", background: "#2e75b6", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          >
            분류 변경 적용
          </button>
          <button
            onClick={() => { alert(`Flag 처리 완료: ${img.fileName}`); onClose(); }}
            style={{ flex: 1, padding: "9px 0", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          >
            🚩 Flag 이동
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 커스텀 Treemap 콘텐츠 ──────────────────────────
function TreemapContent(props: {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; value?: number; fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, value, fill } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />
      {width > 60 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#ffffffcc" fontSize={11}>{value?.toLocaleString()}</text>
        </>
      )}
    </g>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function DatasetQualityPage() {
  const [equipmentGroup, setEquipmentGroup] = useState("Legacy AFVI");
  const [pixelType, setPixelType] = useState("Pixel Color 5.5μm");
  const [chartView, setChartView] = useState<"treemap" | "pareto">("treemap");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showFlagOnly, setShowFlagOnly] = useState(false);

  const displayImages = showFlagOnly ? mockImages.filter(i => i.isFlagged) : mockImages;
  const flagCount = mockImages.filter(i => i.isFlagged).length;

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 페이지 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1f4e79", margin: 0 }}>학습데이터 조회 및 품질관리</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Dataset Quality Management</p>
        </div>
        <button
          onClick={() => alert("데이터 새로고침 완료")}
          style={{ padding: "8px 16px", background: "#2e75b6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* 필터 영역 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
        {/* 장비 그룹 탭 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["Legacy AFVI", "New AFVI"].map(g => (
            <button key={g} onClick={() => setEquipmentGroup(g)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: equipmentGroup === g ? "#2e75b6" : "#f3f4f6",
              color: equipmentGroup === g ? "#fff" : "#374151",
            }}>{g}</button>
          ))}
        </div>

        {/* 픽셀 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["Pixel Color 5.5μm", "ATI Mono 5.5μm", "Pixel Mono 2.0μm", "ATI Mono 2.0μm"].map(p => (
            <button key={p} onClick={() => setPixelType(p)} style={{
              padding: "5px 12px", borderRadius: 6, border: `1px solid ${pixelType === p ? "#2e75b6" : "#d1d5db"}`, cursor: "pointer", fontSize: 12,
              background: pixelType === p ? "#eff6ff" : "#fff",
              color: pixelType === p ? "#2e75b6" : "#6b7280",
            }}>{p}</button>
          ))}
        </div>

        {/* 필터 행 */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
            <option>납체 전체</option><option>납체A</option><option>납체B</option>
          </select>
          <input type="date" defaultValue="2025-01-01" style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
          <span style={{ color: "#9ca3af" }}>~</span>
          <input type="date" defaultValue="2025-12-31" style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>최대 랜덤 수</span>
            <input type="number" defaultValue={100} style={{ width: 80, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 장비별 바 차트 */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1f4e79", marginBottom: 16 }}>장비별 이미지 수량</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={equipmentImageCounts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="equipment" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(v) => [String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "장", "이미지 수"]} />
              <Bar dataKey="count" fill="#2e75b6" radius={[0, 4, 4, 0]}>
                {equipmentImageCounts.map((_, i) => (
                  <Cell key={i} fill={["#2E75B6", "#1F4E79", "#5BA3D9", "#8EC4E8"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 불량유형 분포 */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1f4e79" }}>불량유형 분포</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {(["treemap", "pareto"] as const).map(v => (
                <button key={v} onClick={() => setChartView(v)} style={{
                  padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: chartView === v ? "#2e75b6" : "#f3f4f6",
                  color: chartView === v ? "#fff" : "#6b7280",
                }}>{v === "treemap" ? "Treemap" : "Pareto"}</button>
              ))}
            </div>
          </div>
          {chartView === "treemap" ? (
            <ResponsiveContainer width="100%" height={200}>
              <Treemap data={treemapData} dataKey="value" content={<TreemapContent />} />
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={defectTop10.slice(0, 7)} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="defect" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2e75b6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top 10 테이블 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1f4e79" }}>불량유형 Top 10</h3>
          <button
            onClick={() => alert("CSV 다운로드 완료")}
            style={{ padding: "6px 14px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            📥 CSV 다운로드
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#eff6ff" }}>
              {["순위", "영역", "불량유형", "레이블 수", "비율(%)"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #bfdbfe" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defectTop10.map((row, i) => (
              <tr key={row.rank} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{row.rank}</td>
                <td style={{ padding: "8px 12px" }}>{row.area}</td>
                <td style={{ padding: "8px 12px", fontWeight: 500 }}>{row.defect}</td>
                <td style={{ padding: "8px 12px" }}>{row.count.toLocaleString()}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 6, width: `${row.ratio * 5}px`, background: "#2e75b6", borderRadius: 3 }} />
                    <span>{row.ratio}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 이미지 그리드 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1f4e79", margin: 0 }}>이미지 그리드</h3>
            <Badge text={`Flag ${flagCount}건`} color="red" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowFlagOnly(!showFlagOnly)}
              style={{
                padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none",
                background: showFlagOnly ? "#fee2e2" : "#f3f4f6",
                color: showFlagOnly ? "#991b1b" : "#374151",
              }}
            >
              🚩 {showFlagOnly ? "전체 보기" : "Flag만 보기"}
            </button>
            <button
              onClick={() => alert("Flag 검토 화면으로 이동합니다.")}
              style={{ padding: "7px 14px", background: "#1f4e79", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Flag 검토 합 →
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {displayImages.map(img => (
            <ImageCard key={img.id} img={img} onSelect={setSelectedImage} />
          ))}
        </div>
      </div>

      {/* 분류 변경 모달 */}
      {selectedImage && (
        <LabelModal img={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}
