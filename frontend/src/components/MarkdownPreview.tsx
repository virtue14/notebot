/**
 * @file MarkdownPreview.tsx
 * @description 마크다운 텍스트를 HTML로 렌더링하는 프리뷰 컴포넌트.
 */

"use client";

import React from "react";

interface MarkdownPreviewProps {
  content: string;
}

/** 간이 마크다운 파서로 헤딩, 리스트, 볼드, 코드블록 등을 렌더링한다. */
export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 my-3 ml-4"
          >
            {listItems.map((item, i) => (
              <li key={i} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>,
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("# ")) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-foreground">
            {trimmed.slice(2)}
          </h1>,
        );
      } else if (trimmed.startsWith("## ")) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-5 mb-3 text-foreground border-b border-border pb-2">
            {trimmed.slice(3)}
          </h2>,
        );
      } else if (trimmed.startsWith("### ")) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-foreground">
            {trimmed.slice(4)}
          </h3>,
        );
      } else if (trimmed.startsWith("#### ")) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <h4 key={index} className="text-lg font-semibold mt-3 mb-2 text-foreground">
            {trimmed.slice(5)}
          </h4>,
        );
      } else if (trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
        inList = true;
        const itemContent = trimmed.startsWith("- ")
          ? trimmed.slice(2)
          : trimmed.replace(/^\d+\.\s/, "");
        listItems.push(itemContent);
      } else if (trimmed.startsWith("> ")) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 my-3 italic text-muted-foreground">
            {trimmed.slice(2)}
          </blockquote>,
        );
      } else if (trimmed.includes("**")) {
        if (inList) { flushList(); inList = false; }
        const parts = trimmed.split("**");
        elements.push(
          <p key={index} className="my-2 text-foreground leading-relaxed">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold">{part}</strong>
              ) : (
                part
              ),
            )}
          </p>,
        );
      } else if (trimmed === "") {
        if (inList) { flushList(); inList = false; }
        elements.push(<div key={index} className="h-2" />);
      } else if (trimmed === "---") {
        if (inList) { flushList(); inList = false; }
        elements.push(<hr key={index} className="my-4 border-border" />);
      } else if (trimmed) {
        if (inList) { flushList(); inList = false; }
        elements.push(
          <p key={index} className="my-2 text-foreground leading-relaxed">
            {trimmed}
          </p>,
        );
      }
    });

    if (inList) flushList();
    return elements;
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
}
