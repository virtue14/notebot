/**
 * @file history/[id]/page.tsx
 * @description 변환 기록 상세 페이지. 학습 노트/STT 결과를 렌더링한다.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, FileDown, FileText, Mic, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownPreview, type MarkdownPreviewHandle } from "@/components/MarkdownPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HistoryDetail {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: string;
  stt_content: string | null;
  summary_content: string | null;
  summary_provider: string | null;
  summary_model: string | null;
  created_at: string;
}

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

/** 파일 크기를 읽기 쉬운 형식으로 변환한다. */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const previewRef = useRef<MarkdownPreviewHandle>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/history/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setDetail(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-96" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p className="text-muted-foreground mb-4">이력을 찾을 수 없습니다.</p>
        <Button asChild variant="outline">
          <Link href="/history">이력 목록으로</Link>
        </Button>
      </div>
    );
  }

  const hasSummary = !!detail.summary_content;
  const hasStt = !!detail.stt_content;
  const activeContent = detail.summary_content || detail.stt_content || "";

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사했어요");
    } catch {
      toast.error("복사에 실패했어요");
    }
  };

  const handleDownloadMd = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const el = previewRef.current?.getContentElement();
    if (!el) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (!doc) { document.body.removeChild(iframe); return; }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${detail.file_name} - 학습 노트</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.7; max-width: 800px; margin: 0 auto; font-size: 14px; }
  h1 { font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  h2 { font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 28px; }
  h3 { font-size: 15px; margin-top: 20px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 12px; font-family: monospace; }
  pre { background: #f8f8f8; color: #1a1a1a; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; border: 1px solid #e5e7eb; }
  pre code { background: none; padding: 0; }
  strong { font-weight: 700; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 4px; }
  @media print { body { padding: 20px; } @page { margin: 15mm; } }
</style>
</head><body>${el.innerHTML}</body></html>`);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    };
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("이력을 삭제했어요");
        router.push("/history");
      }
    } catch {
      toast.error("삭제에 실패했어요");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        href="/history"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        이력 목록으로
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {detail.file_name}
            </h1>
            <Badge variant={hasSummary ? "secondary" : "default"}>
              {hasSummary ? "학습 노트" : hasStt ? "STT" : "업로드"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(detail.created_at)}</span>
            <span>{formatFileSize(detail.file_size)}</span>
            {detail.summary_provider && (
              <span>{detail.summary_provider} · {detail.summary_model}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
          삭제
        </Button>
      </div>

      {/* 내용이 없는 경우 */}
      {!hasSummary && !hasStt && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 변환 결과가 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {/* 학습 노트 또는 STT 결과 */}
      {(hasSummary || hasStt) && (
        <>
          {hasSummary && hasStt ? (
            <Tabs defaultValue="summary">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="summary" className="gap-1.5">
                    <FileText className="w-4 h-4" />
                    학습 노트
                  </TabsTrigger>
                  <TabsTrigger value="stt" className="gap-1.5">
                    <Mic className="w-4 h-4" />
                    STT 원문
                  </TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(activeContent)}>
                    <Copy className="w-4 h-4" />
                    복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadMd(detail.summary_content!, "study-note.md")}>
                    <Download className="w-4 h-4" />
                    MD
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                    <FileDown className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
              <TabsContent value="summary">
                <MarkdownPreview ref={previewRef} content={detail.summary_content!} />
              </TabsContent>
              <TabsContent value="stt">
                <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-6 rounded-xl leading-relaxed max-h-[600px] overflow-y-auto">
                  {detail.stt_content}
                </pre>
              </TabsContent>
            </Tabs>
          ) : hasSummary ? (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => handleCopy(detail.summary_content!)}>
                  <Copy className="w-4 h-4" />
                  복사
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadMd(detail.summary_content!, "study-note.md")}>
                  <Download className="w-4 h-4" />
                  MD
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <FileDown className="w-4 h-4" />
                  PDF
                </Button>
              </div>
              <MarkdownPreview ref={previewRef} content={detail.summary_content!} />
            </>
          ) : (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => handleCopy(detail.stt_content!)}>
                  <Copy className="w-4 h-4" />
                  복사
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadMd(detail.stt_content!, "stt-result.txt")}>
                  <Download className="w-4 h-4" />
                  다운로드
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-6 rounded-xl leading-relaxed max-h-[600px] overflow-y-auto">
                {detail.stt_content}
              </pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
