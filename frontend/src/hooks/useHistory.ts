/**
 * @file useHistory.ts
 * @description 변환 이력을 백엔드 API로 관리하는 훅.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** 이력 항목 타입. */
export interface HistoryItem {
  id: string;
  file_name: string;
  mime_type: string;
  status: string;
  has_stt: boolean;
  has_summary: boolean;
  created_at: string;
}

/** 백엔드 API 기반 변환 이력 훅. */
export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/history/`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // 네트워크 에러 무시
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, [fetchHistory]);

  const removeFromHistory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // 에러 무시
    }
  }, []);

  const clearHistory = useCallback(async () => {
    // 전체 삭제 API가 없으므로 개별 삭제 반복
    for (const item of history) {
      await fetch(`${API_BASE}/api/v1/history/${item.id}`, { method: "DELETE" }).catch(() => {});
    }
    setHistory([]);
  }, [history]);

  return { history, removeFromHistory, clearHistory, mounted, loading, refetch: fetchHistory };
}
