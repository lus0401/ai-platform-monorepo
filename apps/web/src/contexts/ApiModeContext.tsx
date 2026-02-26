"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface ApiModeContextValue {
  isMockMode: boolean;
  toggleApiMode: () => void;
}

const ApiModeContext = createContext<ApiModeContextValue | null>(null);

export function ApiModeProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(true);
  const toggleApiMode = useCallback(() => setIsMockMode((v) => !v), []);
  return (
    <ApiModeContext.Provider value={{ isMockMode, toggleApiMode }}>
      {children}
    </ApiModeContext.Provider>
  );
}

export function useApiMode(): ApiModeContextValue {
  const ctx = useContext(ApiModeContext);
  if (!ctx) {
    return {
      isMockMode: true,
      toggleApiMode: () => {},
    };
  }
  return ctx;
}
