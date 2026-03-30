// ──────────────────────────────────────────────────────
// Mock Data — SIMMTECH AI 재학습 플랫폼 PoC
// ──────────────────────────────────────────────────────

export const defectTypes = [
  "AuNiCu도금", "솔더팅형", "과형", "넘침", "함몰",
  "이물질", "크랙", "SMPeeloff", "부유이물", "패턴불량",
];

// ── 화면 ① ─────────────────────────────────────────────
export const equipmentImageCounts = [
  { equipment: "PIXEL 5.5", count: 3400 },
  { equipment: "ATI 5.5",   count: 2800 },
  { equipment: "PIXEL 2.0", count: 1900 },
  { equipment: "ATI 2.0",   count: 1200 },
];

export const defectTop10 = [
  { rank: 1,  area: "SR",      defect: "AuNiCu도금",  count: 1230, ratio: 13.2 },
  { rank: 2,  area: "본드핑거", defect: "솔더팅형",   count:  870, ratio:  9.3 },
  { rank: 3,  area: "SR",      defect: "과형",         count:  740, ratio:  7.9 },
  { rank: 4,  area: "패드",    defect: "넘침",          count:  610, ratio:  6.5 },
  { rank: 5,  area: "본드핑거", defect: "이물질",      count:  550, ratio:  5.9 },
  { rank: 6,  area: "비아홀",  defect: "함몰",          count:  490, ratio:  5.2 },
  { rank: 7,  area: "SR",      defect: "크랙",          count:  430, ratio:  4.6 },
  { rank: 8,  area: "패드",    defect: "SMPeeloff",    count:  380, ratio:  4.1 },
  { rank: 9,  area: "본드핑거", defect: "부유이물",    count:  320, ratio:  3.4 },
  { rank: 10, area: "비아홀",  defect: "패턴불량",      count:  280, ratio:  3.0 },
];

export const treemapData = [
  { name: "AuNiCu도금", value: 1230, fill: "#2E75B6" },
  { name: "솔더팅형",   value:  870, fill: "#1F4E79" },
  { name: "과형",       value:  740, fill: "#C55A11" },
  { name: "넘침",       value:  610, fill: "#375623" },
  { name: "이물질",     value:  550, fill: "#7B5EA7" },
  { name: "함몰",       value:  490, fill: "#6B0000" },
  { name: "크랙",       value:  430, fill: "#5BA3D9" },
  { name: "SMPeeloff",  value:  380, fill: "#4A7C59" },
  { name: "부유이물",   value:  320, fill: "#9E4C00" },
  { name: "패턴불량",   value:  280, fill: "#6A3D9A" },
];

export const mockImages = Array.from({ length: 21 }, (_, i) => ({
  id: `img-${i + 1}`,
  fileName: `${["SR", "BF", "PAD", "VIA"][i % 4]}_${defectTypes[i % defectTypes.length].replace(/\s/g, "")}_202501${String(i + 1).padStart(2, "0")}.png`,
  area: ["SR", "본드핑거", "패드", "비아홀"][i % 4],
  defect: defectTypes[i % defectTypes.length],
  label: ["CLF", "FALSE", "CLF-SEG"][i % 3],
  width: 300,
  height: 300,
  date: `2025-01-${String(i + 1).padStart(2, "0")}`,
  isFlagged: i % 7 === 0,
  color: `hsl(${(i * 37) % 360}, 40%, ${55 + (i % 3) * 10}%)`,
}));

// ── 화면 ② ─────────────────────────────────────────────
export const mockFolders = [
  { id: "f1", name: "PIXEL5_CLF_251120",    equipment: "PIXEL 5.5", model: "CLF",     imageCount: 2400, sizeGb: 4.2, createdAt: "2025-11-20", status: "Ready" },
  { id: "f2", name: "PIXEL5_FALSE_251201",  equipment: "PIXEL 5.5", model: "FALSE",   imageCount: 1800, sizeGb: 3.1, createdAt: "2025-12-01", status: "Ready" },
  { id: "f3", name: "ATI_CLF_250915",       equipment: "ATI 5.5",   model: "CLF",     imageCount: 3100, sizeGb: 5.4, createdAt: "2025-09-15", status: "Ready" },
  { id: "f4", name: "PIXEL2_CLFSEG_251030", equipment: "PIXEL 2.0", model: "CLF-SEG", imageCount: 1200, sizeGb: 2.1, createdAt: "2025-10-30", status: "Ready" },
  { id: "f5", name: "ATI2_FALSE_251115",    equipment: "ATI 2.0",   model: "FALSE",   imageCount:  900, sizeGb: 1.6, createdAt: "2025-11-15", status: "Ready" },
];

export const mockValidationResult = {
  items: [
    { name: "이미지 형식 검증",    status: "pass",    detail: "4,200 / 4,200 통과 (PNG 300×300)" },
    { name: "해상도 일관성 검증",  status: "pass",    detail: "300×300 px 통일 확인" },
    { name: "라벨 파일 존재 여부", status: "pass",    detail: "전체 라벨 파일 존재 확인" },
    { name: "라벨 일관성 검증",    status: "warning", detail: "12개 항목 표기 불일치 ('AuNiCu도금' ↔ 'AuNiCu')" },
    { name: "클래스 분포 검사",    status: "warning", detail: "3개 클래스 50개 미만 — Augmentation 보완 권장" },
  ],
  passCount: 3,
  warnCount: 2,
  failCount: 0,
};

// ── 화면 ③ ─────────────────────────────────────────────
export const mockTrainingProgress = Array.from({ length: 100 }, (_, i) => {
  const e = i + 1;
  const noise = () => (Math.random() - 0.5) * 0.01;
  const trainLoss = +(Math.max(0.021, 0.45 * Math.exp(-0.042 * e) + noise())).toFixed(4);
  const valLoss   = +(Math.max(0.028, 0.48 * Math.exp(-0.038 * e) + noise() * 1.5)).toFixed(4);
  const accuracy  = +(Math.min(96.8, 58 + 38 * (1 - Math.exp(-0.048 * e)) + noise() * 2)).toFixed(2);
  return { epoch: e, trainLoss, valLoss, accuracy };
});

export const mockModelResults = [
  { epoch: 100, accuracy: 95.2, overDetect: 1.2, missDetect: 0.8, lr: 0.0001, grade: "EXCELLENT", path: "models/PIXEL5_CLF_260325/epoch100.pth" },
  { epoch:  85, accuracy: 93.8, overDetect: 1.8, missDetect: 1.1, lr: 0.0001, grade: "GOOD",      path: "models/PIXEL5_CLF_260325/epoch85.pth"  },
  { epoch:  70, accuracy: 91.2, overDetect: 2.3, missDetect: 1.5, lr: 0.0001, grade: "NORMAL",    path: "models/PIXEL5_CLF_260325/epoch70.pth"  },
  { epoch:  50, accuracy: 87.6, overDetect: 3.1, missDetect: 2.2, lr: 0.0001, grade: "NORMAL",    path: "models/PIXEL5_CLF_260325/epoch50.pth"  },
];

export const gpuOptions = [
  { value: "gpu0", label: "GPU 0 — NVIDIA A100 (Available)" },
  { value: "gpu1", label: "GPU 1 — NVIDIA A100 (Available)" },
];

export const datasetFolderOptions = [
  { value: "PIXEL5.5_CLF_Dataset_2025-03", label: "PIXEL5.5_CLF_Dataset_2025-03 (4,200장)" },
  { value: "PIXEL5.5_FALSE_Dataset_2025-02", label: "PIXEL5.5_FALSE_Dataset_2025-02 (2,800장)" },
  { value: "ATI_CLF_Dataset_2025-01", label: "ATI_CLF_Dataset_2025-01 (3,100장)" },
];
