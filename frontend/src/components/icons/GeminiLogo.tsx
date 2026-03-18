/**
 * @file GeminiLogo.tsx
 * @description Google Gemini 로고 SVG 컴포넌트.
 */

interface LogoProps {
  className?: string;
}

/** Google Gemini 로고 아이콘. */
export function GeminiLogo({ className = "w-4 h-4" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
    </svg>
  );
}
