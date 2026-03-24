/**
 * @file MarkdownPreview.tsx
 * @description 마크다운 텍스트를 HTML로 렌더링하는 프리뷰 컴포넌트.
 */

"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface MarkdownPreviewProps {
  content: string;
}

/** 헤딩에서 TOC 항목을 추출한다. */
interface TocItem {
  level: number;
  id: string;
  text: string;
}

function extractToc(htmlString: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([1-3])\s+id="([^"]*)"[^>]*>(.*?)<\/h[1-3]>/g;
  let match;
  while ((match = regex.exec(htmlString)) !== null) {
    const text = match[3].replace(/<[^>]*>/g, "");
    items.push({ level: parseInt(match[1]), id: match[2], text });
  }
  return items;
}

/** markdown-it 인스턴스 (GFM 표, 코드 하이라이팅) */
const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(str: string, lang: string) {
    if (lang === "mermaid") return str;
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
    }
    return "";
  },
});

// 헤딩에 id 속성 추가
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx];
  const level = token.tag;
  const nextToken = tokens[idx + 1];
  const text = nextToken?.children?.map((c) => c.content).join("") || "";
  const id = text.replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "").toLowerCase();
  return `<${level} id="${id}">`;
};

/** LLM 출력의 마크다운 호환성 문제를 전처리한다. */
function normalizeMarkdown(raw: string): string {
  return raw
    // LLM 서문 제거 (첫 번째 # 헤딩 이전 텍스트)
    .replace(/^[\s\S]*?(?=^#\s)/m, "")
    // 유니코드 → ASCII 정규화
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u0060\u02CB\u2032\u2035]/g, "`")
    .replace(/\uFF0A/g, "*")
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    // 볼드 정규화
    .replace(/\*\*[\s\u00A0\u200B]+(?=[가-힣\w(])/g, "**")               // 여는 ** 뒤 모든 공백 제거
    .replace(/([가-힣\w)])[\s\u00A0\u200B]+\*\*(?=[\s|,.:;)]|$)/g, "$1**") // 닫는 ** 앞 모든 공백 제거
    .replace(/\*\*([^*]+)\*\*([가-힣\u4e00-\u9fff])/g, "**$1** $2");
}

/** 마크다운에서 mermaid 코드 블록을 추출하고 placeholder로 치환한다. */
function extractMermaidBlocks(text: string): { cleaned: string; blocks: string[] } {
  const blocks: string[] = [];
  const cleaned = text.replace(/`{3,}mermaid\s*\n([\s\S]*?)`{3,}/g, (_, code) => {
    blocks.push(code.trim());
    return `\n<div id="mermaid-placeholder-${blocks.length - 1}"></div>\n`;
  });
  return { cleaned, blocks };
}

/** 외부에서 본문 영역에 접근하기 위한 핸들. */
export interface MarkdownPreviewHandle {
  getContentElement: () => HTMLDivElement | null;
}

/** 마크다운을 HTML로 렌더링한다. TOC, GFM 표, 코드 하이라이팅, mermaid를 지원한다. */
export const MarkdownPreview = forwardRef<MarkdownPreviewHandle, MarkdownPreviewProps>(
  function MarkdownPreview({ content }, ref) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [mermaidSvgs, setMermaidSvgs] = useState<Record<number, string>>({});

  useImperativeHandle(ref, () => ({
    getContentElement: () => contentRef.current,
  }));

  useEffect(() => {
    const normalized = normalizeMarkdown(content);
    const { cleaned, blocks } = extractMermaidBlocks(normalized);
    let rendered = md.render(cleaned);

    // markdown-it이 파싱 못한 ** bold** 패턴을 HTML에서 직접 변환
    rendered = rendered.replace(/\*\*\s*([^*<]+?)\s*\*\*/g, "<strong>$1</strong>");
    setHtml(rendered);
    setToc(extractToc(rendered));

    if (blocks.length > 0) {
      import("mermaid").then(({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: "neutral", fontFamily: "inherit", suppressErrorRendering: true });
        const svgs: Record<number, string> = {};
        Promise.all(
          blocks.map(async (code, i) => {
            try {
              const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}-${i}`, code);
              svgs[i] = svg;
            } catch {
              svgs[i] = `<pre class="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>${code}</code></pre>`;
            }
          })
        ).then(() => setMermaidSvgs(svgs));
      }).catch(() => {});
    }
  }, [content]);

  const mergedHtml = Object.entries(mermaidSvgs).reduce(
    (acc, [i, svg]) =>
      acc.replace(
        `<div id="mermaid-placeholder-${i}"></div>`,
        `<div class="my-4 flex justify-center overflow-x-auto">${svg}</div>`
      ),
    html
  );

  // XSS 방지: DOMPurify로 sanitize (mermaid SVG 허용)
  const finalHtml = DOMPurify.sanitize(mergedHtml, {
    ADD_TAGS: ["svg", "g", "path", "rect", "circle", "line", "polyline", "polygon", "text", "tspan", "marker", "defs", "clipPath", "foreignObject", "style"],
    ADD_ATTR: ["viewBox", "xmlns", "fill", "stroke", "d", "cx", "cy", "r", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "transform", "class", "id", "style", "marker-end", "font-size", "text-anchor", "dominant-baseline", "points"],
  });

  if (!finalHtml) {
    return (
      <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
        {content}
      </pre>
    );
  }

  return (
    <div className="flex gap-8">
      <div
        ref={contentRef}
        className="prose prose-slate dark:prose-invert max-w-none min-w-0 flex-1"
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />

      {toc.length > 2 && (
        <nav className="hidden xl:block w-52 flex-shrink-0">
          <div className="sticky top-8">
            <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">목차</p>
            <ul className="space-y-1.5 border-l border-border pl-3">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                  <a
                    href={`#${item.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors leading-snug block"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
});
