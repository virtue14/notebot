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
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              공부에만 집중하세요
            </h1>
            <p className="text-lg text-muted-foreground">
              강의 녹음과 교재를 체계적인 학습 노트로 정리해드려요
            </p>
          </div>

          {/* 서비스 카드 */}
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/stt" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">음성 텍스트 변환</CardTitle>
                  <CardDescription className="text-base">
                    녹음 파일을 텍스트 그대로 받고 싶을 때
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#10003;</span>
                      <span>STT(음성 인식) 기술 기반 변환</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#10003;</span>
                      <span>MP3, MP4 등 미디어 파일 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#10003;</span>
                      <span>발화 내용을 있는 그대로 텍스트로 출력</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">&#10003;</span>
                      <span>다중 파일 동시 업로드</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      시작하기 &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/stt-summary" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg border-2 hover:border-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">강의 노트 정리</CardTitle>
                  <CardDescription className="text-base">
                    녹음이나 교재를 정리된 학습 노트로 받고 싶을 때
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">&#10003;</span>
                      <span>STT(음성 인식) 변환 + 내용 정리까지 한번에</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">&#10003;</span>
                      <span>MP3, MP4, TXT, PDF 모두 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">&#10003;</span>
                      <span>목차와 핵심 내용을 자동으로 구성</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">&#10003;</span>
                      <span>마크다운 형식의 깔끔한 노트 출력</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full font-medium group-hover:bg-purple-600 group-hover:text-white transition-all">
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
              <div className="p-6 bg-card rounded-xl shadow-sm border">
                <div className="flex items-center justify-center mb-3">
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  학습에 최적화
                </h3>
                <p className="text-sm text-muted-foreground">
                  강의와 교재를 한눈에 정리해요
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl shadow-sm border">
                <div className="flex items-center justify-center mb-3">
                  <Moon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  다크 모드
                </h3>
                <p className="text-sm text-muted-foreground">
                  밤에도 편하게 볼 수 있어요
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl shadow-sm border">
                <div className="flex items-center justify-center mb-3">
                  <HardDrive className="w-8 h-8 text-muted-foreground" />
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
          <footer className="mt-20 pt-8 border-t text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Notebot. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
