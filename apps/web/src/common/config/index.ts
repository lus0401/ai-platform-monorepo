const env: NodeJS.ProcessEnv =
  typeof process !== "undefined" ? process.env : ({} as NodeJS.ProcessEnv);

export const appConfig = {
  appName: (env.NEXT_PUBLIC_APP_NAME as string | undefined) ?? "AI Platform",
  apiBaseUrl: (env.NEXT_PUBLIC_API_URL as string | undefined) ?? "",
};

export const apiConfig = {
  baseUrl: appConfig.apiBaseUrl,
  timeout: 30_000,
};
