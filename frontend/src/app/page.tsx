/**
 * @file page.tsx
 * @description 메인 페이지. 추후 파일 업로드 UI로 교체 예정.
 */

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Notebot</h1>
      <p className="mt-2 text-muted-foreground">
        AI 학습 노트 생성 플랫폼
      </p>
    </div>
  );
}
