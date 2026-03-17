/**
 * @file useTheme.ts
 * @description 다크모드 토글을 위한 테마 상태 관리 훅.
 */

"use client";

import { useState, useEffect } from "react";

/** localStorage 기반 라이트/다크 테마 전환 훅. */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("notebot-theme");
    const initial = saved === "light" || saved === "dark" ? saved : "light";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("notebot-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, mounted };
}
