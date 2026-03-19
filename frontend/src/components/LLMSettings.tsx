/**
 * @file LLMSettings.tsx
 * @description LLM 플랫폼, 모델, API 키 설정 컴포넌트.
 */

"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { OpenAILogo } from "@/components/icons/OpenAILogo";
import { AnthropicLogo } from "@/components/icons/AnthropicLogo";
import { GeminiLogo } from "@/components/icons/GeminiLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SETTINGS_KEY = "notebot_llm_settings";

interface ModelInfo {
  id: string;
  name: string;
  tag: string;
}

const PROVIDER_MODELS: Record<string, ModelInfo[]> = {
  openai: [
    { id: "gpt-5-mini", name: "GPT-5 Mini", tag: "추천 · 가성비" },
    { id: "gpt-5.4", name: "GPT-5.4", tag: "고성능" },
    { id: "gpt-5.3-codex", name: "GPT-5.3 Codex", tag: "코드 특화" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-6", name: "Sonnet 4.6", tag: "추천 · 빠르고 균형" },
    { id: "claude-opus-4-6", name: "Opus 4.6", tag: "최고 성능" },
    { id: "claude-haiku-4-5", name: "Haiku 4.5", tag: "초고속 · 저비용" },
  ],
  gemini: [
    { id: "gemini-2.5-flash", name: "2.5 Flash", tag: "추천 · 무료" },
    { id: "gemini-2.5-pro", name: "2.5 Pro", tag: "고성능 · 무료" },
    { id: "gemini-2.5-flash-lite", name: "2.5 Flash Lite", tag: "초경량 · 무료" },
    { id: "gemini-3-flash", name: "3 Flash", tag: "최신 · 유료" },
    { id: "gemini-3.1-pro", name: "3.1 Pro", tag: "최신 고성능 · 유료" },
    { id: "gemini-3.1-flash-lite", name: "3.1 Flash Lite", tag: "최신 경량 · 유료" },
  ],
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

const PROVIDER_KEY_URLS: Record<string, { url: string; label: string }> = {
  openai: { url: "https://platform.openai.com/api-keys", label: "OpenAI API 키 발급받기" },
  anthropic: { url: "https://console.anthropic.com/settings/keys", label: "Anthropic API 키 발급받기" },
  gemini: { url: "https://aistudio.google.com/apikey", label: "Gemini API 키 발급받기" },
};

const DEFAULT_PROVIDER = "";

/** LLM 설정 값. */
export interface LLMConfig {
  provider: string;
  model: string;
  apiKey: string;
}

/** LLMSettings 컴포넌트 props. */
interface LLMSettingsProps {
  onConfigChange: (config: LLMConfig) => void;
}

/** 플랫폼/모델/API키 설정을 담는 독립 컴포넌트. */
export function LLMSettings({ onConfigChange }: LLMSettingsProps) {
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    openai: PROVIDER_MODELS.openai[0].id,
    anthropic: PROVIDER_MODELS.anthropic[0].id,
    gemini: PROVIDER_MODELS.gemini[0].id,
  });
  const [apiKey, setApiKey] = useState("");

  // localStorage에서 provider/selectedModels 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        // provider는 복원하지 않음 (항상 미선택 상태로 시작)
        if (settings.selectedModels) setSelectedModels(settings.selectedModels);
      }
    } catch {
      // 손상된 데이터 무시
    }
  }, []);

  // 설정 변경 시 부모에 전달
  useEffect(() => {
    onConfigChange({ provider, model: selectedModels[provider] ?? "", apiKey });
  }, [provider, selectedModels, apiKey, onConfigChange]);

  // provider/selectedModels만 저장 (apiKey 절대 포함 안 함)
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ selectedModels }));
  }, [selectedModels]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI 설정</CardTitle>
          {provider && (
            <span className="text-xs text-muted-foreground">
              {PROVIDER_LABELS[provider]} · {PROVIDER_MODELS[provider].find((m) => m.id === selectedModels[provider])?.name}
            </span>
          )}
        </div>
        <CardDescription>요약에 사용할 플랫폼과 모델을 선택해주세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 플랫폼 선택 */}
        <div className="flex justify-center gap-2">
          {Object.entries(PROVIDER_MODELS).map(([p]) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(provider === p ? "" : p)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium",
                "transition-all duration-300 ease-out",
                provider === p
                  ? "bg-muted border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {p === "openai" && <OpenAILogo className="w-4 h-4 flex-shrink-0" />}
              {p === "anthropic" && <AnthropicLogo className="w-4 h-4 flex-shrink-0" />}
              {p === "gemini" && <GeminiLogo className="w-4 h-4 flex-shrink-0" />}
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap text-sm font-medium flex items-center",
                  "transition-all duration-300 ease-out",
                  provider === p || provider === ""
                    ? "max-w-[150px] opacity-100 ml-1.5"
                    : "max-w-0 opacity-0 ml-0"
                )}
              >
                {PROVIDER_LABELS[p]}
                {p === "gemini" && (
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">
                    무료
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* 모델 선택 + API 키 — grid-rows 슬라이드 */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            provider ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-4">
              {provider === "gemini" && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Google AI Studio에서 무료로 사용할 수 있어요 (일일 횟수 제한 있음)
                </p>
              )}
              <Select
                value={selectedModels[provider || "anthropic"]}
                onValueChange={(v) => setSelectedModels((prev) => ({ ...prev, [provider || "anthropic"]: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_MODELS[provider || "anthropic"].map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center justify-between w-full">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{m.tag}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label htmlFor="apikey">API 키</Label>
                <Input
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API 키를 입력해주세요"
                />
                <a
                  href={PROVIDER_KEY_URLS[provider || "anthropic"].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {PROVIDER_KEY_URLS[provider || "anthropic"].label} &rarr;
                </a>
              </div>

              {/* 보안 안내 */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <Lock className="w-3 h-3 flex-shrink-0" />
                <span>API 키는 어디에도 저장되지 않아요. 요약 요청 시에만 사용되고 즉시 폐기돼요.</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
