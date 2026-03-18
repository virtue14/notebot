/**
 * @file page.tsx
 * @description 메인 랜딩 페이지. 히어로 섹션, 서비스 카드, 플랫폼 특징을 포함한다.
 */

import Link from "next/link";
import { Mic, FileText, GraduationCap, Moon, HardDrive } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* 히어로 섹션 */}
          <div className="text-center mb-20 pt-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              공부에만 집중하세요
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              강의 녹음과 교재를 체계적인 학습 노트로 정리해드려요
            </p>
          </div>

          {/* 서비스 카드 */}
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/stt" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 mb-4">
                    <Mic className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">음성 텍스트 변환</CardTitle>
                  <CardDescription className="text-base">
                    녹음 파일을 텍스트 그대로 받고 싶을 때
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 mt-0.5 shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">&#10003;</span>
                      </span>
                      <span>음성 인식 기술로 정확하게 변환</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 mt-0.5 shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">&#10003;</span>
                      </span>
                      <span>MP3, MP4 등 미디어 파일 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 mt-0.5 shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">&#10003;</span>
                      </span>
                      <span>발화 내용을 있는 그대로 텍스트로 출력</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 mt-0.5 shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">&#10003;</span>
                      </span>
                      <span>다중 파일 동시 업로드</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                      시작하기 &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/stt-summary" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 mb-4">
                    <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl">강의 노트 정리</CardTitle>
                  <CardDescription className="text-base">
                    텍스트나 PDF를 정리된 학습 노트로 받고 싶을 때
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/40 mt-0.5 shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 text-xs">&#10003;</span>
                      </span>
                      <span>TXT, PDF 파일 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/40 mt-0.5 shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 text-xs">&#10003;</span>
                      </span>
                      <span>업로드한 내용을 체계적으로 정리</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/40 mt-0.5 shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 text-xs">&#10003;</span>
                      </span>
                      <span>목차와 핵심 내용을 자동으로 구성</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/40 mt-0.5 shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 text-xs">&#10003;</span>
                      </span>
                      <span>마크다운 형식의 깔끔한 노트 출력</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                      시작하기 &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 플랫폼 특징 */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              플랫폼 특징
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-muted/50 rounded-2xl">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  학습에 최적화
                </h3>
                <p className="text-sm text-muted-foreground">
                  강의와 교재를 한눈에 정리해요
                </p>
              </div>
              <div className="p-8 bg-muted/50 rounded-2xl">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                    <Moon className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  다크 모드
                </h3>
                <p className="text-sm text-muted-foreground">
                  밤에도 편하게 볼 수 있어요
                </p>
              </div>
              <div className="p-8 bg-muted/50 rounded-2xl">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  로컬 저장
                </h3>
                <p className="text-sm text-muted-foreground">
                  노트를 브라우저에 안전하게 보관해요
                </p>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <footer className="mt-24 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Notebot. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
