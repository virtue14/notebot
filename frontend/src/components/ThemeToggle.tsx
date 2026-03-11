/**
 * @file ThemeToggle.tsx
 * @description 라이트/다크 모드 전환 버튼 컴포넌트.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/useTheme";

/** 현재 테마에 따라 아이콘과 레이블을 전환하는 토글 버튼. */
export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2 w-[120px]">
        <span className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          라이트 모드
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          다크 모드
        </>
      )}
    </Button>
  );
}
