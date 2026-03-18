/**
 * @file FileUploader.tsx
 * @description 드래그 앤 드롭 방식의 파일 업로드 컴포넌트.
 */

"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileAudio, FileVideo, FileText, File } from "lucide-react";
import { Button } from "./ui/button";

/** FileUploader에 전달되는 props. */
interface FileUploaderProps {
  accept: string;
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

/** 파일 크기를 사람이 읽기 쉬운 문자열로 변환한다. */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/** 파일 확장자에 따라 적절한 아이콘을 반환한다. */
function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["mp3", "wav", "aac", "m4a"].includes(ext || ""))
    return <FileAudio className="w-8 h-8 text-blue-500" />;
  if (["mp4", "mov", "avi", "mkv"].includes(ext || ""))
    return <FileVideo className="w-8 h-8 text-purple-500" />;
  if (["txt", "pdf", "doc", "docx"].includes(ext || ""))
    return <FileText className="w-8 h-8 text-green-500" />;
  return <File className="w-8 h-8 text-muted-foreground" />;
}

/** 드래그 앤 드롭 및 클릭으로 파일을 선택할 수 있는 업로더. */
export function FileUploader({
  accept,
  onFilesSelected,
  maxFiles = 10,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (files: File[]) => {
      const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, maxFiles, onFilesSelected],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(Array.from(e.dataTransfer.files));
    },
    [handleFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files));
      }
    },
    [handleFiles],
  );

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
  };

  return (
    <div className="w-full">
      <div
        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-10 md:p-12 text-center transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-border hover:border-muted-foreground bg-card"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              dragActive
                ? "bg-blue-100 dark:bg-blue-900/50"
                : "bg-muted"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                dragActive
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                파일을 선택
              </span>
              <span className="text-lg text-muted-foreground">
                {" "}
                하거나 여기로 드래그하세요
              </span>
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              최대 {maxFiles}개 파일 업로드 가능
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              선택된 파일 ({selectedFiles.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              전체 삭제
            </Button>
          </div>
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-muted-foreground transition-colors"
              >
                <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  aria-label={`${file.name} 삭제`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
