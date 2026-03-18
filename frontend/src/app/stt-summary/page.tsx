/**
 * @file stt-summary/page.tsx
 * @description 학습 노트 페이지. 텍스트/PDF 업로드 → API 연동 → 마크다운 노트 결과.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import {
  ProcessingSteps,
  type ProcessingStep,
} from "@/components/ProcessingSteps";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { LLMSettings, type LLMConfig } from "@/components/LLMSettings";

type PageState = "upload" | "processing" | "done" | "error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 1, message: "파일을 업로드하고 있어요", completedMessage: "파일 업로드가 완료됐어요", completed: false },
  { id: 2, message: "내용을 분석하고 있어요", completedMessage: "내용 분석이 끝났어요", completed: false },
  { id: 3, message: "학습 노트를 만들고 있어요", completedMessage: "학습 노트가 완성됐어요", completed: false },
];

export default function SttSummaryPage() {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({ provider: "anthropic", model: "claude-sonnet-4-6", apiKey: "" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleConfigChange = useCallback((config: LLMConfig) => {
    setLlmConfig(config);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("파일을 선택해주세요.");
      return;
    }
    if (!llmConfig.apiKey) {
      toast.error("API 키를 입력해주세요.");
      return;
    }

    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setPageState("processing");
    setErrorMessage("");
    const updatedSteps = [...INITIAL_STEPS];

    // Step 1: 파일 업로드
    setCurrentStep(0);
    let uploadId: string;
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const uploadRes = await fetch(`${API_BASE}/api/v1/upload/`, {
        method: "POST",
        body: formData,
        signal,
      });
      if (!uploadRes.ok) {
        let message = "업로드에 실패했어요";
        try { const err = await uploadRes.json(); message = err.detail || message; } catch {}
        throw new Error(message);
      }
      const uploadData = await uploadRes.json();
      uploadId = uploadData.id;
      updatedSteps[0] = { ...updatedSteps[0], completed: true };
      setSteps([...updatedSteps]);
    } catch (e) {
      if (signal.aborted) return;
      const msg = e instanceof Error ? e.message : "업로드에 실패했어요";
      setErrorMessage(msg);
      setPageState("error");
      return;
    }

    // Step 2-3: AI 요약 요청
    setCurrentStep(1);
    let summaryContent: string;
    try {
      const summaryRes = await fetch(`${API_BASE}/api/v1/summary/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_id: uploadId,
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
        if (summaryRes.status === 502) {
          throw new Error("AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요.");
        }
        throw new Error(err.detail || "요약에 실패했어요");
      }
      const summaryData = await summaryRes.json();
      summaryContent = summaryData.content;
      updatedSteps[1] = { ...updatedSteps[1], completed: true };
      setSteps([...updatedSteps]);
    } catch (e) {
      if (signal.aborted) return;
      const msg = e instanceof Error ? e.message : "요약에 실패했어요";
      setErrorMessage(msg);
      setPageState("error");
      return;
    }

    // Step 3: 학습 노트 완성
    setCurrentStep(2);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatedSteps[2] = { ...updatedSteps[2], completed: true };
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

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-note.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPageState("upload");
    setFiles([]);
    setSteps(INITIAL_STEPS);
    setCurrentStep(0);
    setResult("");
    setErrorMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        메인으로 돌아가기
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        학습 노트
      </h1>
      <p className="text-muted-foreground mb-8">
        텍스트나 PDF 파일을 업로드하면 체계적인 학습 노트로 정리해드려요
      </p>

      {pageState === "upload" && (
        <div className="space-y-6">
          <LLMSettings onConfigChange={handleConfigChange} />
          <FileUploader
            accept=".txt,.pdf,text/plain,application/pdf"
            onFilesSelected={setFiles}
            maxFiles={1}
          />
          {files.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleUpload}>
                학습 노트 생성
              </Button>
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
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">문제가 발생했어요</p>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>
                설정 변경하기
              </Button>
              <Button onClick={handleUpload}>
                다시 시도하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pageState === "done" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>학습 노트</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                    복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    다운로드
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MarkdownPreview content={result} />
            </CardContent>
          </Card>
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
