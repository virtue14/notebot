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
          className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
            index === currentStep
              ? "bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500"
              : step.completed
                ? "bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800"
                : "bg-muted/50 border border-border opacity-60"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {step.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : index === currentStep ? (
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-border" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`font-medium ${
                index === currentStep
                  ? "text-blue-900 dark:text-blue-100"
                  : step.completed
                    ? "text-green-900 dark:text-green-100"
                    : "text-muted-foreground"
              }`}
            >
              {step.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
