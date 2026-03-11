/**
 * @file Header.tsx
 * @description 전역 헤더 컴포넌트. 로고, 네비게이션, 테마 토글을 포함한다.
 */

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

/** 모든 페이지 상단에 표시되는 공통 헤더. */
export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Notebot</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              변환 기록
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
