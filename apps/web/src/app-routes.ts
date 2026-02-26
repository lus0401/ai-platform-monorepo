/**
 * 앱 사이드바/브레드크럼용 라우트 설정 (Next.js App Router 경로 기준)
 */
export interface RouteItem {
  path: string;
  label: string;
}

export interface RouteGroup {
  path: string;
  label: string;
  children?: RouteItem[];
}

export const sidebarRoutes: RouteGroup[] = [
  {
    path: "/dashboard",
    label: "대시보드",
    children: [{ path: "/dashboard", label: "대시보드" }],
  },
  {
    path: "/master",
    label: "마스터",
    children: [
      { path: "/master/customers", label: "고객사" },
      { path: "/master/products", label: "제품" },
      { path: "/master/defect-classes", label: "불량 등급" },
      { path: "/master/defect-types", label: "불량 유형" },
    ],
  },
  {
    path: "/inference",
    label: "추론",
    children: [
      { path: "/inference/jobs", label: "추론 작업" },
      { path: "/inference/run", label: "추론 실행" },
      { path: "/inference/metrics", label: "추론 메트릭" },
    ],
  },
  {
    path: "/training",
    label: "학습",
    children: [
      { path: "/training/datasets", label: "데이터셋" },
      { path: "/training/models", label: "모델" },
      { path: "/training/run", label: "학습 실행" },
      { path: "/training/validation", label: "검증" },
      { path: "/training/images/search", label: "이미지 검색" },
      { path: "/training/images/extract", label: "이미지 추출" },
      { path: "/training/images/slicer", label: "슬라이서" },
      { path: "/training/images/synthesize", label: "이미지 합성" },
    ],
  },
  {
    path: "/criteria",
    label: "기준",
    children: [
      { path: "/criteria/judgement-criteria", label: "판정 기준" },
      { path: "/criteria/customer-spec", label: "고객 사양" },
      { path: "/criteria/measurement-parameters", label: "측정 파라미터" },
    ],
  },
];

export const settingsRoute: RouteItem = {
  path: "/settings/user",
  label: "설정",
};
