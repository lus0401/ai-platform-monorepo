"use client";

import { ReactNode } from "react";
import { ApiModeProvider } from "@/contexts/ApiModeContext";

export function Providers({ children }: { children: ReactNode }) {
  return <ApiModeProvider>{children}</ApiModeProvider>;
}
