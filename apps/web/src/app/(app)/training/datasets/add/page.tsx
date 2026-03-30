"use client";

import { useState, useEffect } from "react";
import { mockFolders, mockValidationResult } from "@/lib/mockData";

type Folder = typeof mockFolders[number];
type Step = 1 | 2 | 3;
type ValidationStatus = "idle" | "running" | "done";
type MergeStatus = "idle" | "running" | "done";

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "폴더 선택" },
    { n: 2, label: "정합성 검증" },
    { n: 3, label: "병합 및 학습셋 생성" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14,
              background: current > s.n ? "#2e75b6" : current === s.n ? "#1f4e79" : "#e5e7eb",
              color: current >= s.n ? "#fff" : "#9ca3af",
            }}>
              {current > s.n ? "✓" : s.n}
            </div>
            <span style={{ fontSize: 12, fontWeight: current === s.n ? 700 : 400, color: current === s.n ? "#1f4e79" : "#6b7280", whiteSpace: "nowrap" }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: current > s.n + 1 ? "#2e75b6" : "#e5e7eb", margin: "0 8px", marginBottom: 22 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "pass")    return <span style={{ color: "#16a34a", fontSize: 18 }}>✅</span>;
  if (status === "warning") return <span style={{ color: "#d97706", fontSize: 18 }}>⚠️</span>;
  return                          <span style={{ color: "#dc2626", fontSize: 18 }}>❌</span>;
}

export default function DatasetAddPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
  const [validationProgress, setValidationProgress] = useState(0);
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>("idle");
  const [mergeProgress, setMergeProgress] = useState(0);
  const [datasetName, setDatasetName] = useState("PIXEL5.5_CLF_Dataset_2026-03");
  const [trainRatio, setTrainRatio] = useState(70);
  const [valRatio, setValRatio] = useState(20);
  const [testRatio, setTestRatio] = useState(10);
  const [augmentation, setAugmentation] = useState<"none" | "basic" | "advanced">("basic");
  const [scanPath, setScanPath] = useState("D:\\SIMMTECH\\TrainingData");

  const totalImages = mockFolders.filter(f => selectedFolders.has(f.id)).reduce((s, f) => s + f.imageCount, 0);
  const totalSize = mockFolders.filter(f => selectedFolders.has(f.id)).reduce((s, f) => s + f.sizeGb, 0).toFixed(1);
  const ratioSum = trainRatio + valRatio + testRatio;

  const toggleFolder = (id: string) => {
    setSelectedFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 검증 시뮬레이션
  const runValidation = () => {
    setValidationStatus("running");
    setValidationProgress(0);
    const interval = setInterval(() => {
      setValidationProgress(p => {
        if (p >= 100) { clearInterval(interval); setValidationStatus("done"); return 100; }
        return p + 8;
      });
    }, 150);
  };

  // 병합 시뮬레이션
  const runMerge = () => {
    setMergeStatus("running");
    setMergeProgress(0);
    const interval = setInterval(() => {
      setMergeProgress(p => {
        if (p >= 100) { clearInterval(interval); setMergeStatus("done"); return 100; }
        return p + 5;
      });
    }, 200);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 헤더 */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1f4e79", margin: 0 }}>학습 데이터 추가 및 정합성 검증</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Data Validation & Dataset Creation</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 32px", border: "1px solid #e5e7eb" }}>
        <StepIndicator current={step} />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", marginBottom: 16 }}>STEP 1 — 폴더 선택</h3>

            {/* 필터 */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <select style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
                <option>검사 장비 전체</option><option>PIXEL 5.5</option><option>ATI 5.5</option>
              </select>
              <select style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
                <option>AI 모델 전체</option><option>FALSE</option><option>CLF</option><option>CLF-SEG</option>
              </select>
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <input
                  value={scanPath}
                  onChange={e => setScanPath(e.target.value)}
                  style={{ flex: 1, padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}
                  placeholder="데이터 경로 입력"
                />
                <button
                  onClick={() => alert("폴더 스캔 완료")}
                  style={{ padding: "7px 16px", background: "#2e75b6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  📂 폴더 스캔
                </button>
              </div>
            </div>

            {/* 폴더 테이블 */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#eff6ff" }}>
                  <th style={{ padding: "8px 12px", width: 40, borderBottom: "2px solid #bfdbfe" }}>
                    <input type="checkbox" onChange={e => {
                      if (e.target.checked) setSelectedFolders(new Set(mockFolders.map(f => f.id)));
                      else setSelectedFolders(new Set());
                    }} />
                  </th>
                  {["폴더명", "장비", "모델", "이미지 수", "용량(GB)", "생성일", "상태"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #bfdbfe" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockFolders.map((f, i) => (
                  <tr key={f.id} style={{ background: selectedFolders.has(f.id) ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <input type="checkbox" checked={selectedFolders.has(f.id)} onChange={() => toggleFolder(f.id)} />
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>{f.name}</td>
                    <td style={{ padding: "8px 12px" }}>{f.equipment}</td>
                    <td style={{ padding: "8px 12px" }}>{f.model}</td>
                    <td style={{ padding: "8px 12px" }}>{f.imageCount.toLocaleString()}</td>
                    <td style={{ padding: "8px 12px" }}>{f.sizeGb}</td>
                    <td style={{ padding: "8px 12px" }}>{f.createdAt}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 선택 요약 */}
            <div style={{ marginTop: 14, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, display: "flex", gap: 24, fontSize: 13 }}>
              <span>선택: <strong>{selectedFolders.size}개 폴더</strong></span>
              <span>총 이미지: <strong>{totalImages.toLocaleString()}개</strong></span>
              <span>총 용량: <strong>{totalSize} GB</strong></span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                disabled={selectedFolders.size === 0}
                onClick={() => setStep(2)}
                style={{ padding: "9px 24px", background: selectedFolders.size > 0 ? "#1f4e79" : "#e5e7eb", color: selectedFolders.size > 0 ? "#fff" : "#9ca3af", border: "none", borderRadius: 6, cursor: selectedFolders.size > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", marginBottom: 16 }}>STEP 2 — 정합성 검증</h3>

            {validationStatus === "idle" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#6b7280", marginBottom: 20 }}>선택한 {selectedFolders.size}개 폴더 ({totalImages.toLocaleString()}개 이미지)에 대해 검증을 시작합니다.</p>
                <button
                  onClick={runValidation}
                  style={{ padding: "10px 28px", background: "#2e75b6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                >
                  ⚙ 검증 시작
                </button>
              </div>
            )}

            {validationStatus === "running" && (
              <div style={{ padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#374151" }}>
                  <span>정합성 검증 중...</span>
                  <span>{validationProgress}%</span>
                </div>
                <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5 }}>
                  <div style={{ height: "100%", width: `${validationProgress}%`, background: "#2e75b6", borderRadius: 5, transition: "width 0.2s" }} />
                </div>
              </div>
            )}

            {validationStatus === "done" && (
              <div>
                <div style={{ display: "flex", flex: "column", gap: 12, marginBottom: 20 }}>
                  {mockValidationResult.items.map(item => (
                    <div key={item.name} style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                      background: item.status === "pass" ? "#f0fdf4" : item.status === "warning" ? "#fffbeb" : "#fef2f2",
                      borderRadius: 8, border: `1px solid ${item.status === "pass" ? "#bbf7d0" : item.status === "warning" ? "#fde68a" : "#fecaca"}`,
                      marginBottom: 8,
                    }}>
                      <StatusIcon status={item.status} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: "#6b7280", margin: "3px 0 0" }}>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", background: "#eff6ff", borderRadius: 8, display: "flex", gap: 20, fontSize: 13 }}>
                  <span>✅ 통과: <strong>{mockValidationResult.passCount}</strong></span>
                  <span>⚠️ 경고: <strong>{mockValidationResult.warnCount}</strong></span>
                  <span>❌ 실패: <strong>{mockValidationResult.failCount}</strong></span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ padding: "9px 20px", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← 이전</button>
              <button
                disabled={validationStatus !== "done"}
                onClick={() => setStep(3)}
                style={{ padding: "9px 24px", background: validationStatus === "done" ? "#1f4e79" : "#e5e7eb", color: validationStatus === "done" ? "#fff" : "#9ca3af", border: "none", borderRadius: 6, cursor: validationStatus === "done" ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", marginBottom: 20 }}>STEP 3 — 병합 및 학습셋 생성</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>데이터셋 이름</label>
                <input value={datasetName} onChange={e => setDatasetName(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Train / Val / Test 비율</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {([ ["Train", trainRatio, setTrainRatio], ["Val", valRatio, setValRatio], ["Test", testRatio, setTestRatio] ] as [string, number, (v: number) => void][]).map(([label, value, setter]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, color: "#6b7280", width: 32 }}>{label}</span>
                      <input
                        type="number" min={0} max={100}
                        value={value}
                        onChange={e => setter(Number(e.target.value))}
                        style={{ width: 60, padding: "7px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, textAlign: "center" }}
                      />
                      <span style={{ fontSize: 13 }}>%</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 13, fontWeight: 700, color: ratioSum === 100 ? "#16a34a" : "#dc2626" }}>
                    합계: {ratioSum}% {ratioSum === 100 ? "✅" : "❌"}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>데이터 증강</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {(["none", "basic", "advanced"] as const).map(v => (
                    <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                      <input type="radio" name="aug" value={v} checked={augmentation === v} onChange={() => setAugmentation(v)} />
                      {v === "none" ? "없음" : v === "basic" ? "기본" : "고급"}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>저장 경로</label>
                <input defaultValue="D:\SIMMTECH\MergedDatasets"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            {mergeStatus === "idle" && (
              <button
                disabled={ratioSum !== 100}
                onClick={runMerge}
                style={{ marginTop: 24, padding: "10px 28px", background: ratioSum === 100 ? "#2e75b6" : "#e5e7eb", color: ratioSum === 100 ? "#fff" : "#9ca3af", border: "none", borderRadius: 6, cursor: ratioSum === 100 ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600 }}
              >
                ⚙ 병합 시작
              </button>
            )}

            {mergeStatus === "running" && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span>병합 처리 중...</span><span>{mergeProgress}%</span>
                </div>
                <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5 }}>
                  <div style={{ height: "100%", width: `${mergeProgress}%`, background: "#2e75b6", borderRadius: 5, transition: "width 0.2s" }} />
                </div>
              </div>
            )}

            {mergeStatus === "done" && (
              <div style={{ marginTop: 24, padding: "16px 20px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
                <p style={{ fontWeight: 700, color: "#166534", marginBottom: 10 }}>✅ 병합 완료!</p>
                <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                  <span>총 이미지: <strong>{totalImages.toLocaleString()}개</strong></span>
                  <span>Train: <strong>{Math.round(totalImages * trainRatio / 100).toLocaleString()}개</strong></span>
                  <span>Val: <strong>{Math.round(totalImages * valRatio / 100).toLocaleString()}개</strong></span>
                  <span>Test: <strong>{Math.round(totalImages * testRatio / 100).toLocaleString()}개</strong></span>
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>데이터셋 이름: {datasetName} | 생성일: 2026-03-25</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={{ padding: "9px 20px", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← 이전</button>
              {mergeStatus === "done" && (
                <button onClick={() => alert("학습 실행 화면으로 이동합니다.")}
                  style={{ padding: "9px 24px", background: "#1f4e79", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  학습 시작 →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
