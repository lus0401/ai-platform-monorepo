"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "theme-preference";

export function useTheme() {
  const [isDark, setIsDarkState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as "dark" | "light" | null;
    setIsDarkState(stored === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkState((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
