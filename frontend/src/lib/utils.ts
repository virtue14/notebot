/**
 * @file utils.ts
 * @description 프로젝트 전역에서 사용하는 유틸리티 함수.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** TailwindCSS 클래스를 조건부로 병합한다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
