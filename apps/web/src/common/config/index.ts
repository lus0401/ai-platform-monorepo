const env: NodeJS.ProcessEnv =
  typeof process !== "undefined" ? process.env : ({} as NodeJS.ProcessEnv);

export const appConfig = {
  appName: (env.NEXT_PUBLIC_APP_NAME as string | undefined) ?? "AI Platform",
  /** 앱 표시 이름 (헤더/로고 등) */
  name: (env.NEXT_PUBLIC_APP_NAME as string | undefined) ?? "AI Platform",
  /** 회사 로고 이미지 URL (선택, 없으면 앱 이름 텍스트 표시) */
  companyLogoUrl: env.NEXT_PUBLIC_COMPANY_LOGO_URL as string | undefined,
  apiBaseUrl: (env.NEXT_PUBLIC_API_URL as string | undefined) ?? "",
};

export const apiConfig = {
  baseUrl: appConfig.apiBaseUrl,
  timeout: 30_000,
};
