/**
 * @file AnthropicLogo.tsx
 * @description Anthropic 로고 SVG 컴포넌트.
 */

interface LogoProps {
  className?: string;
}

/** Anthropic 로고 아이콘. */
export function AnthropicLogo({ className = "w-4 h-4" }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541zm-.372 10.339l2.676-6.95 2.676 6.95z" />
    </svg>
  );
}
