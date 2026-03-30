"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { mockTrainingProgress, mockModelResults, gpuOptions, datasetFolderOptions } from "@/lib/mockData";

type TrainingStatus = "idle" | "running" | "paused" | "done" | "cancelled";

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  EXCELLENT: { bg: "#fef9c3", text: "#854d0e" },
  GOOD:      { bg: "#dcfce7", text: "#166534" },
  NORMAL:    { bg: "#f3f4f6", text: "#374151" },
};

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_COLORS[grade] ?? GRADE_COLORS.NORMAL;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
      {grade === "EXCELLENT" ? "★ " : ""}{grade}
    </span>
  );
}

export default function TrainingRunPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<TrainingStatus>("idle");
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);
  const [deployed, setDeployed] = useState(false);

  const [equipment, setEquipment] = useState("PIXEL 5.5");
  const [modelType, setModelType] = useState("CLF");
  const [dataset, setDataset] = useState(datasetFolderOptions[0].value);
  const [gpu, setGpu] = useState(gpuOptions[0].value);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs] = useState(100);
  const [lr, setLr] = useState(0.0001);

  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progressData = mockTrainingProgress.slice(0, currentEpoch);
  const etaMinutes = Math.max(0, Math.round((epochs - currentEpoch) * 0.12));

  const startTraining = () => {
    setStatus("running");
    setCurrentEpoch(0);
    setLogs(["[시작] 학습 초기화 중...", "[시작] YOLOv8 모델 로딩 완료", "[시작] 데이터셋 로딩 완료"]);
    setStep(2);
    let ep = 0;
    intervalRef.current = setInterval(() => {
      ep++;
      setCurrentEpoch(ep);
      const d = mockTrainingProgress[ep - 1];
      setLogs(prev => [
        ...prev.slice(-80),
        `[Epoch ${ep}/${epochs}] Train Loss: ${d.trainLoss} | Val Loss: ${d.valLoss} | Acc: ${d.accuracy}%`,
      ]);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      if (ep >= epochs) {
        clearInterval(intervalRef.current!);
        setStatus("done");
        setLogs(prev => [...prev, "[완료] 학습이 성공적으로 완료되었습니다.", "[완료] 모델 저장 완료: PIXEL5_CLF_260325/epoch100.pth"]);
      }
    }, 80);
  };

  const pauseTraining = () => {
    clearInterval(intervalRef.current!);
    setStatus("paused");
    setLogs(prev => [...prev, "[일시정지] 학습이 일시 중단되었습니다."]);
  };

  const resumeTraining = () => {
    setStatus("running");
    setLogs(prev => [...prev, "[재개] 학습을 재개합니다."]);
    let ep = currentEpoch;
    intervalRef.current = setInterval(() => {
      ep++;
      setCurrentEpoch(ep);
      const d = mockTrainingProgress[ep - 1];
      setLogs(prev => [...prev.slice(-80), `[Epoch ${ep}/${epochs}] Train Loss: ${d.trainLoss} | Val Loss: ${d.valLoss} | Acc: ${d.accuracy}%`]);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      if (ep >= epochs) { clearInterval(intervalRef.current!); setStatus("done"); }
    }, 80);
  };

  const stopTraining = () => {
    clearInterval(intervalRef.current!);
    setStatus("cancelled");
    setLogs(prev => [...prev, "[중지] 사용자에 의해 학습이 중단되었습니다."]);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const handleDeploy = () => {
    if (!selectedEpoch) { alert("배포할 모델을 선택해주세요."); return; }
    if (!confirm(`Epoch ${selectedEpoch} 모델을 운영 환경에 배포하시겠습니까?`)) return;
    setDeployed(true);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1f4e79", margin: 0 }}>모델 학습 / 결과분석 / 배포</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Model Training & Deployment</p>
      </div>

      {/* STEP 1 — 학습 구성 */}
      {step === 1 && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", marginBottom: 20 }}>STEP 1-2 — 학습 구성 설정</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 700 }}>
            {[
              { label: "검사 장비", value: equipment, onChange: setEquipment, options: ["PIXEL 5.5", "ATI 5.5", "PIXEL 2.0", "ATI 2.0"] },
              { label: "AI 모델 타입", value: modelType, onChange: setModelType, options: ["FALSE", "CLF", "CLF-SEG"] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>학습 데이터 폴더</label>
              <select value={dataset} onChange={e => setDataset(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
                {datasetFolderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>GPU 선택</label>
              <select value={gpu} onChange={e => setGpu(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
                {gpuOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* 하이퍼파라미터 */}
          <div style={{ marginTop: 20, padding: "16px 20px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>하이퍼파라미터 설정</p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Batch Size (16~64)</label>
                <input type="number" min={16} max={64} value={batchSize}
                  onChange={e => setBatchSize(Number(e.target.value))}
                  style={{ width: 90, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, textAlign: "center" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Epochs (고정: 100)</label>
                <input value={100} disabled
                  style={{ width: 90, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, textAlign: "center", background: "#f3f4f6", color: "#9ca3af" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Learning Rate</label>
                <input type="number" step={0.0001} min={0.0003} max={0.021} value={lr}
                  onChange={e => setLr(Number(e.target.value))}
                  style={{ width: 110, padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, textAlign: "center" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Optimizer</label>
                <input value="Adam (고정)" disabled
                  style={{ width: 110, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, background: "#f3f4f6", color: "#9ca3af" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button onClick={startTraining}
              style={{ padding: "10px 28px", background: "#1f4e79", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
              ▶ 학습 시작
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — 모니터링 */}
      {step === 2 && (
        <>
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", margin: 0 }}>STEP 3 — 학습 실행 및 모니터링</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {status === "running" && (
                  <>
                    <button onClick={pauseTraining}
                      style={{ padding: "7px 16px", background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ⏸ 일시정지
                    </button>
                    <button onClick={stopTraining}
                      style={{ padding: "7px 16px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ⏹ 중지
                    </button>
                  </>
                )}
                {status === "paused" && (
                  <>
                    <button onClick={resumeTraining}
                      style={{ padding: "7px 16px", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ▶ 재개
                    </button>
                    <button onClick={stopTraining}
                      style={{ padding: "7px 16px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ⏹ 중지
                    </button>
                  </>
                )}
                {status === "done" && <span style={{ background: "#dcfce7", color: "#166534", padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>✅ 학습 완료</span>}
                {status === "cancelled" && <span style={{ background: "#fee2e2", color: "#991b1b", padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>⏹ 중단됨</span>}
              </div>
            </div>

            {/* 진행률 바 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", marginBottom: 8 }}>
                <span>Epoch {currentEpoch} / {epochs}</span>
                <span>{status === "running" ? `예상 완료: 약 ${etaMinutes}분 후` : status === "done" ? "완료" : status === "paused" ? "일시정지" : "중단"}</span>
              </div>
              <div style={{ height: 12, background: "#e5e7eb", borderRadius: 6 }}>
                <div style={{
                  height: "100%", width: `${(currentEpoch / epochs) * 100}%`, borderRadius: 6, transition: "width 0.1s",
                  background: status === "cancelled" ? "#ef4444" : status === "done" ? "#16a34a" : "#2e75b6",
                }} />
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                {Math.round((currentEpoch / epochs) * 100)}%
              </div>
            </div>

            {/* 현재 지표 */}
            {currentEpoch > 0 && (
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {[
                  ["Train Loss", mockTrainingProgress[currentEpoch - 1]?.trainLoss],
                  ["Val Loss",   mockTrainingProgress[currentEpoch - 1]?.valLoss],
                  ["Accuracy",  `${mockTrainingProgress[currentEpoch - 1]?.accuracy}%`],
                  ["LR",        lr],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ flex: 1, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 17, fontWeight: 700, color: "#1f4e79", margin: "4px 0 0" }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 로그 패널 */}
            <div ref={logRef}
              style={{ height: 160, background: "#1e1e2e", borderRadius: 8, padding: "12px 14px", overflowY: "auto", fontFamily: "monospace", fontSize: 11, color: "#a6e3a1", lineHeight: 1.6 }}>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>

          {/* 결과 분석 */}
          {(status === "done" || currentEpoch > 15) && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f4e79", marginBottom: 20 }}>STEP 4 — 결과 분석 및 배포</h3>

              {/* 차트 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Loss Curve</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={progressData} margin={{ left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#2e75b6" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#c55a11" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Accuracy Curve</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={progressData} margin={{ left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[50, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#16a34a" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 모델 비교 테이블 — 학습 완료 후만 표시 */}
              {status === "done" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>모델 선택</p>
                    <button onClick={() => alert("Excel 리포트 다운로드")}
                      style={{ padding: "6px 14px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      📥 Excel 리포트
                    </button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
                    <thead>
                      <tr style={{ background: "#eff6ff" }}>
                        {["선택", "Epoch", "Accuracy(%)", "과검률(%)", "미검률(%)", "등급", "모델 경로"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #bfdbfe" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockModelResults.map((r, i) => (
                        <tr key={r.epoch} style={{ background: selectedEpoch === r.epoch ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "8px 12px" }}>
                            <input type="radio" name="model" checked={selectedEpoch === r.epoch} onChange={() => setSelectedEpoch(r.epoch)} />
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{r.epoch}</td>
                          <td style={{ padding: "8px 12px" }}>{r.accuracy}</td>
                          <td style={{ padding: "8px 12px" }}>{r.overDetect}</td>
                          <td style={{ padding: "8px 12px" }}>{r.missDetect}</td>
                          <td style={{ padding: "8px 12px" }}><GradeBadge grade={r.grade} /></td>
                          <td style={{ padding: "8px 12px", fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{r.path}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!deployed ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button onClick={handleDeploy}
                        style={{ padding: "12px 40px", background: selectedEpoch ? "#1f4e79" : "#e5e7eb", color: selectedEpoch ? "#fff" : "#9ca3af", border: "none", borderRadius: 8, cursor: selectedEpoch ? "pointer" : "not-allowed", fontSize: 15, fontWeight: 700 }}>
                        ✓ 선택 모델 운영 배포
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "16px 20px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, textAlign: "center" }}>
                      <p style={{ fontWeight: 700, color: "#166534", fontSize: 15, margin: 0 }}>
                        ✅ Epoch {selectedEpoch} 모델이 운영 환경에 배포되었습니다!
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0" }}>배포 일시: 2026-03-25 | 배포자: 관리자</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
