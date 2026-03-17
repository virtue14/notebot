/**
 * @file stt/page.tsx
 * @description STT 변환 페이지. 파일 업로드 → 변환 처리 → 결과 표시 흐름을 관리한다.
 */

"use client";

import { useEffect, useState } from "react";
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

/** 페이지 상태: 업로드 대기 / 처리 중 / 완료 */
type PageState = "upload" | "processing" | "done";

const STORAGE_KEY = "notebot-stt-state";

/** sessionStorage에 저장할 상태 */
interface SttSessionState {
  pageState: PageState;
  result: string;
  fileNames: string[];
}

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 1, message: "파일을 업로드하고 있어요", completedMessage: "파일 업로드가 완료됐어요", completed: false },
  { id: 2, message: "오디오를 추출하고 있어요", completedMessage: "오디오 추출이 끝났어요", completed: false },
  { id: 3, message: "음성을 인식하고 있어요", completedMessage: "음성 인식이 끝났어요", completed: false },
  { id: 4, message: "텍스트를 정리하고 있어요", completedMessage: "텍스트 정리가 끝났어요", completed: false },
];

export default function SttPage() {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);

  // sessionStorage에서 상태 복원
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: SttSessionState = JSON.parse(saved);
        setPageState(state.pageState === "done" ? "done" : "upload");
        setResult(state.result);
        setFileNames(state.fileNames);
      }
    } catch {
      // 손상된 데이터 무시
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    setPageState("processing");
    const updatedSteps = [...INITIAL_STEPS];

    // Step 1: 파일 업로드
    setCurrentStep(0);
    let uploadId: string;
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const uploadRes = await fetch("http://localhost:8000/api/v1/upload/", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail || "업로드에 실패했어요");
      }
      const uploadData = await uploadRes.json();
      uploadId = uploadData.id;
      updatedSteps[0] = { ...updatedSteps[0], completed: true };
      setSteps([...updatedSteps]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "업로드에 실패했어요");
      setPageState("upload");
      setSteps(INITIAL_STEPS);
      return;
    }

    // Step 2: 오디오 추출 (서버에서 처리, UI에서 짧은 대기)
    setCurrentStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updatedSteps[1] = { ...updatedSteps[1], completed: true };
    setSteps([...updatedSteps]);

    // Step 3: 음성 인식 — 폴링으로 서버 상태 확인
    setCurrentStep(2);
    const POLL_INTERVAL = 2000;
    const POLL_TIMEOUT = 10 * 60 * 1000; // 10분
    const startTime = Date.now();

    let sttContent: string | null = null;
    try {
      while (Date.now() - startTime < POLL_TIMEOUT) {
        const statusRes = await fetch(`http://localhost:8000/api/v1/upload/${uploadId}`);
        if (!statusRes.ok) throw new Error("상태 조회에 실패했어요");
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          sttContent = statusData.stt_content;
          break;
        }
        if (statusData.status === "failed") {
          throw new Error("변환에 실패했어요. 다시 시도해주세요.");
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      if (!sttContent) {
        throw new Error("변환 시간이 초과됐어요. 다시 시도해주세요.");
      }

      updatedSteps[2] = { ...updatedSteps[2], completed: true };
      setSteps([...updatedSteps]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "변환에 실패했어요");
      setPageState("upload");
      setSteps(INITIAL_STEPS);
      return;
    }

    // Step 4: 텍스트 정리
    setCurrentStep(3);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatedSteps[3] = { ...updatedSteps[3], completed: true };
    setSteps([...updatedSteps]);

    // 결과 표시
    const resultText = sttContent;
    setResult(resultText);
    setPageState("done");

    const names = files.map((f) => f.name);
    setFileNames(names);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pageState: "done", result: resultText, fileNames: names }),
    );
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
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stt-result.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPageState("upload");
    setFiles([]);
    setSteps(INITIAL_STEPS);
    setCurrentStep(0);
    setResult("");
    setFileNames([]);
    sessionStorage.removeItem(STORAGE_KEY);
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

      <h1 className="text-3xl font-bold text-foreground mb-2">STT 변환</h1>
      <p className="text-muted-foreground mb-8">
        음성이나 영상 파일을 텍스트로 변환해드려요
      </p>

      {pageState === "upload" && (
        <div className="space-y-6">
          <FileUploader
            accept="audio/*,video/*"
            onFilesSelected={setFiles}
            maxFiles={5}
          />
          {files.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleUpload}>
                변환 시작
              </Button>
            </div>
          )}
        </div>
      )}

      {pageState === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>변환 진행 중</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingSteps steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>
      )}

      {pageState === "done" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>변환 결과</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(files.length > 0 ? files.map((f) => f.name) : fileNames).join(", ")}
                  </p>
                </div>
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
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted p-4 rounded-lg">
                {result}
              </pre>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              다시 변환하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
