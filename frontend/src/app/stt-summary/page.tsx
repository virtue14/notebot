/**
 * @file stt-summary/page.tsx
 * @description STT 변환 + AI 요약 페이지. 파일 업로드 → 7단계 처리 → 마크다운 노트 결과.
 */

"use client";

import { useState } from "react";
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

type PageState = "upload" | "processing" | "done";

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 1, message: "파일을 업로드하고 있어요", completedMessage: "파일 업로드가 완료됐어요", completed: false },
  { id: 2, message: "오디오를 추출하고 있어요", completedMessage: "오디오 추출이 끝났어요", completed: false },
  { id: 3, message: "음성을 인식하고 있어요", completedMessage: "음성 인식이 끝났어요", completed: false },
  { id: 4, message: "텍스트를 합치고 있어요", completedMessage: "텍스트 합치기가 끝났어요", completed: false },
  { id: 5, message: "내용을 분석하고 있어요", completedMessage: "내용 분석이 끝났어요", completed: false },
  { id: 6, message: "학습 노트를 만들고 있어요", completedMessage: "학습 노트가 완성됐어요", completed: false },
  { id: 7, message: "마지막으로 정리하고 있어요", completedMessage: "모든 정리가 끝났어요", completed: false },
];

const DEMO_RESULT = `# 데이터 구조 강의 노트

## 1. 배열 (Array)

배열은 **동일한 타입**의 데이터를 연속된 메모리 공간에 저장하는 자료구조이다.

### 특징
- 인덱스를 통한 O(1) 접근
- 고정 크기 (정적 배열)
- 캐시 친화적 구조

### 시간 복잡도
- 접근: O(1)
- 검색: O(n)
- 삽입/삭제: O(n)

---

## 2. 연결 리스트 (Linked List)

각 노드가 **데이터**와 **다음 노드를 가리키는 포인터**로 구성된다.

### 특징
- 동적 크기 조절 가능
- 삽입/삭제가 O(1) (위치를 알 때)
- 순차 접근만 가능

---

## 3. 스택과 큐

> 스택은 LIFO, 큐는 FIFO 방식으로 동작한다.

### 스택 (Stack)
- push: 맨 위에 삽입
- pop: 맨 위에서 제거
- 활용: 함수 호출 스택, 괄호 검사, Undo

### 큐 (Queue)
- enqueue: 뒤에 삽입
- dequeue: 앞에서 제거
- 활용: BFS, 작업 스케줄링, 버퍼`;

export default function SttSummaryPage() {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    setPageState("processing");
    const updatedSteps = [...INITIAL_STEPS];

    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      updatedSteps[i] = { ...updatedSteps[i], completed: true };
      setSteps([...updatedSteps]);
    }

    setResult(DEMO_RESULT);
    setPageState("done");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
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
        STT 변환 + 학습 노트
      </h1>
      <p className="text-muted-foreground mb-8">
        음성, 영상, 문서 파일을 분석해서 학습 노트로 정리해드려요
      </p>

      {pageState === "upload" && (
        <div className="space-y-6">
          <FileUploader
            accept="audio/*,video/*,.txt,.pdf"
            onFilesSelected={setFiles}
            maxFiles={10}
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
