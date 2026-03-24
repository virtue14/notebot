/**
 * @file stt-summary/page.tsx
 * @description 학습 노트 페이지. 텍스트/PDF 업로드 → API 연동 → 마크다운 노트 결과.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Copy, Download, FileDown, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import {
  ProcessingSteps,
  type ProcessingStep,
} from "@/components/ProcessingSteps";
import { MarkdownPreview, type MarkdownPreviewHandle } from "@/components/MarkdownPreview";
import { LLMSettings, type LLMConfig } from "@/components/LLMSettings";
import { cn } from "@/lib/utils";

type PageState = "upload" | "processing" | "done" | "error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 1, message: "내용을 분석하고 있어요", completedMessage: "내용 분석이 끝났어요", completed: false },
  { id: 2, message: "학습 노트를 만들고 있어요", completedMessage: "학습 노트가 완성됐어요", completed: false },
];

export default function SttSummaryPage() {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({ provider: "", model: "", apiKey: "" });
  const [llmHighlight, setLlmHighlight] = useState(false);
  const llmSettingsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<MarkdownPreviewHandle>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleConfigChange = useCallback((config: LLMConfig) => {
    setLlmConfig(config);
  }, []);

  // 파일 선택 시 즉시 업로드
  const handleFilesSelected = async (selected: File[]) => {
    setFiles(selected);
    if (selected.length === 0) {
      setUploadIds([]);
      return;
    }

    setUploading(true);
    setUploadIds([]);

    const ids: string[] = [];
    for (const file of selected) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE}/api/v1/upload/`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          let message = "업로드에 실패했어요";
          try { const err = await res.json(); message = err.detail || message; } catch {}
          throw new Error(message);
        }
        const data = await res.json();
        ids.push(data.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "업로드에 실패했어요";
        toast.error(`${file.name}: ${msg}`);
        setFiles([]);
        setUploadIds([]);
        setUploading(false);
        return;
      }
    }

    setUploadIds(ids);
    setUploading(false);
  };

  // 학습 노트 생성 (AI 요약만 처리)
  const handleGenerate = async () => {
    if (uploadIds.length === 0) return;
    if (!llmConfig.provider || !llmConfig.apiKey) {
      toast.error(!llmConfig.provider ? "플랫폼을 선택해주세요." : "API 키를 입력해주세요.");
      setLlmHighlight(true);
      llmSettingsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setLlmHighlight(false), 2000);
      return;
    }

    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setPageState("processing");
    setErrorMessage("");
    const updatedSteps = [...INITIAL_STEPS];

    // Step 1: AI 분석
    setCurrentStep(0);
    let summaryContent: string;
    try {
      // 첫 번째 파일로 요약 요청
      const summaryRes = await fetch(`${API_BASE}/api/v1/summary/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_ids: uploadIds,
          provider: llmConfig.provider,
          model: llmConfig.model,
          api_key: llmConfig.apiKey,
        }),
        signal,
      });
      if (!summaryRes.ok) {
        const err = await summaryRes.json().catch(() => ({}));
        if (summaryRes.status === 401) {
          throw new Error("API 키가 올바르지 않아요. 키를 다시 확인해주세요.");
        }
        if (summaryRes.status === 429) {
          throw new Error("요청이 너무 많아요. 잠시 후 다시 시도해주세요.");
        }
        if (summaryRes.status === 502) {
          throw new Error("AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요.");
        }
        throw new Error(err.detail || "요약에 실패했어요");
      }
      const summaryData = await summaryRes.json();
      summaryContent = summaryData.content;
      updatedSteps[0] = { ...updatedSteps[0], completed: true };
      setSteps([...updatedSteps]);
    } catch (e) {
      if (signal.aborted) return;
      const msg = e instanceof Error ? e.message : "요약에 실패했어요";
      setErrorMessage(msg);
      setPageState("error");
      return;
    }

    // Step 2: 학습 노트 완성
    setCurrentStep(1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatedSteps[1] = { ...updatedSteps[1], completed: true };
    setSteps([...updatedSteps]);

    setResult(summaryContent);
    setPageState("done");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success("클립보드에 복사했어요");
    } catch {
      toast.error("클립보드 복사에 실패했어요");
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-note.md";
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
<title>학습 노트</title>
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
  blockquote { border-left: 3px solid #3b82f6; padding-left: 12px; color: #6b7280; }
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

  const handleReset = () => {
    setPageState("upload");
    setFiles([]);
    setUploadIds([]);
    setUploading(false);
    setSteps(INITIAL_STEPS);
    setCurrentStep(0);
    setResult("");
    setErrorMessage("");
  };

  const canGenerate = uploadIds.length > 0 && !uploading;

  return (
    <div className={cn("container mx-auto px-4 py-8", pageState === "done" ? "max-w-6xl" : "max-w-4xl")}>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        메인으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
        학습 노트
      </h1>
      <p className="text-muted-foreground mb-10">
        텍스트나 PDF 파일을 업로드하면 체계적인 학습 노트로 정리해드려요
      </p>

      {pageState === "upload" && (
        <div className="space-y-6">
          <div
            ref={llmSettingsRef}
            className={cn(
              "rounded-xl transition-all duration-500",
              llmHighlight && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <LLMSettings onConfigChange={handleConfigChange} />
          </div>
          <FileUploader
            accept=".txt,.pdf,text/plain,application/pdf"
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
          />
          {files.length > 0 && (
            <div className="flex justify-center">
              {uploading ? (
                <Button size="lg" disabled>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  업로드 중...
                </Button>
              ) : (
                <Button size="lg" onClick={handleGenerate} disabled={!canGenerate}>
                  학습 노트 생성
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {pageState === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>분석 진행 중</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingSteps steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>
      )}

      {pageState === "error" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">문제가 발생했어요</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">{errorMessage}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>
                설정 변경하기
              </Button>
              <Button onClick={handleGenerate}>
                다시 시도하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pageState === "done" && (
        <div className="space-y-6">
          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
              복사
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadMd}>
              <Download className="w-4 h-4" />
              MD
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <FileDown className="w-4 h-4" />
              PDF
            </Button>
          </div>

          {/* 본문 + TOC */}
          <MarkdownPreview ref={previewRef} content={result} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              다시 분석하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
