/**
 * @file useHistory.ts
 * @description 변환 이력을 localStorage로 관리하는 훅.
 */

"use client";

import { useState, useEffect } from "react";

/** 이력 항목 타입. */
export interface HistoryItem {
  id: string;
  fileName: string;
  type: "stt" | "summary";
  createdAt: string;
  data: string;
}

/** localStorage 기반 변환 이력 CRUD 훅. */
export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("notebot-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // 손상된 데이터는 무시
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("notebot-history", JSON.stringify(history));
  }, [history, mounted]);

  const addToHistory = (item: Omit<HistoryItem, "id" | "createdAt">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory, mounted };
}
