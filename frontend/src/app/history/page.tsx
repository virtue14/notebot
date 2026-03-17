/**
 * @file history/page.tsx
 * @description 변환 이력 페이지. localStorage에 저장된 이력을 조회/삭제한다.
 */

"use client";

import { ArrowLeft, Trash2, FileText, Mic } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHistory } from "@/hooks/useHistory";

/** 날짜 문자열을 읽기 쉬운 형식으로 변환한다. */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory, mounted } = useHistory();

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    toast.success("이력이 삭제되었습니다.");
  };

  const handleClearAll = () => {
    clearHistory();
    toast.success("모든 이력이 삭제되었습니다.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        메인으로 돌아가기
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">변환 기록</h1>
          <p className="text-muted-foreground mt-1">
            총 {history.length}건의 이력
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4" />
            전체 삭제
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="text-5xl mb-4"
              aria-hidden="true"
            >
              &#x1F4DD;
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              아직 변환 이력이 없습니다
            </h2>
            <p className="text-muted-foreground mb-6">
              STT 변환이나 AI 학습 노트를 생성해보세요
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/stt">STT 변환</Link>
              </Button>
              <Button asChild>
                <Link href="/stt-summary">AI 학습 노트</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-shrink-0">
                  {item.type === "stt" ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {item.fileName}
                    </p>
                    <Badge variant={item.type === "stt" ? "default" : "secondary"}>
                      {item.type === "stt" ? "STT" : "AI 노트"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  aria-label={`${item.fileName} 이력 삭제`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
