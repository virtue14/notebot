/**
 * @file ProcessingSteps.tsx
 * @description 파일 처리 진행 단계를 시각적으로 표시하는 컴포넌트.
 */

"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

/** 개별 처리 단계 정보. */
export interface ProcessingStep {
  id: number;
  message: string;
  completedMessage?: string;
  completed: boolean;
}

interface ProcessingStepsProps {
  steps: ProcessingStep[];
  currentStep: number;
}

/** 각 단계의 진행 상태를 아이콘과 스타일로 구분하여 보여준다. */
export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
            index === currentStep
              ? "bg-muted"
              : step.completed
                ? "opacity-100"
                : "opacity-40"
          }`}
        >
          <div className="flex-shrink-0">
            {step.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : index === currentStep ? (
              <Loader2 className="w-6 h-6 text-foreground animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-border" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`font-medium ${
                index === currentStep || step.completed
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.completed && step.completedMessage ? step.completedMessage : step.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
