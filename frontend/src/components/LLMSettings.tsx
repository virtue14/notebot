/**
 * @file LLMSettings.tsx
 * @description LLM 플랫폼, 모델, API 키 설정 컴포넌트.
 */

"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { OpenAILogo } from "@/components/icons/OpenAILogo";
import { AnthropicLogo } from "@/components/icons/AnthropicLogo";
import { GeminiLogo } from "@/components/icons/GeminiLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "notebot_llm_config";

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
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", tag: "추천 · 빠르고 균형" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", tag: "최고 성능" },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", tag: "초고속 · 저비용" },
  ],
  gemini: [
    { id: "gemini-3-flash", name: "Gemini 3 Flash", tag: "추천 · 빠름" },
    { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", tag: "고성능" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", tag: "초경량" },
  ],
};

const PROVIDER_KEY_URLS: Record<string, { url: string; label: string }> = {
  openai: { url: "https://platform.openai.com/api-keys", label: "OpenAI API 키 발급받기" },
  anthropic: { url: "https://console.anthropic.com/settings/keys", label: "Anthropic API 키 발급받기" },
  gemini: { url: "https://aistudio.google.com/apikey", label: "Gemini API 키 발급받기" },
};

const DEFAULT_PROVIDER = "anthropic";

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
  const [model, setModel] = useState(PROVIDER_MODELS[DEFAULT_PROVIDER][0].id);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveKey, setSaveKey] = useState(false);

  // localStorage에서 설정 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.provider) setProvider(config.provider);
        if (config.model) setModel(config.model);
        if (config.apiKey) {
          setApiKey(config.apiKey);
          setSaveKey(true);
        }
      }
    } catch {
      // 손상된 데이터 무시
    }
  }, []);

  // 설정 변경 시 부모에 전달
  useEffect(() => {
    onConfigChange({ provider, model, apiKey });
  }, [provider, model, apiKey, onConfigChange]);

  // localStorage 저장/삭제
  useEffect(() => {
    if (saveKey && apiKey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, model, apiKey }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [saveKey, provider, model, apiKey]);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    // 플랫폼 변경 시 추천 모델로 자동 선택
    setModel(PROVIDER_MODELS[newProvider][0].id);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>AI 설정</CardTitle>
        <CardDescription>
          요약에 사용할 플랫폼과 모델을 선택해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={provider} onValueChange={handleProviderChange}>
          <TabsList className="w-full h-11 p-1">
            <TabsTrigger value="openai" className="flex-1 flex items-center gap-1.5">
              <OpenAILogo className="w-4 h-4" />
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="anthropic" className="flex-1 flex items-center gap-1.5">
              <AnthropicLogo className="w-4 h-4" />
              Anthropic
            </TabsTrigger>
            <TabsTrigger value="gemini" className="flex-1 flex items-center gap-1.5">
              <GeminiLogo className="w-4 h-4" />
              Gemini
            </TabsTrigger>
          </TabsList>

          {Object.keys(PROVIDER_MODELS).map((p) => (
            <TabsContent key={p} value={p} className="space-y-4 pt-4">
              {/* API 키 입력 */}
              <div className="space-y-2">
                <Label htmlFor={`apikey-${p}`}>API 키</Label>
                <div className="relative">
                  <Input
                    id={`apikey-${p}`}
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API 키를 입력해주세요"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? "API 키 숨기기" : "API 키 보기"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <a
                  href={PROVIDER_KEY_URLS[p].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {PROVIDER_KEY_URLS[p].label} &rarr;
                </a>
              </div>

              {/* 모델 선택 */}
              <div className="space-y-2">
                <Label>모델</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[p].map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} · {m.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 저장 옵션 */}
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveKey}
                  onChange={(e) => setSaveKey(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                다음에도 사용할게요
              </label>
            </TabsContent>
          ))}
        </Tabs>

        {/* 보안 안내 */}
        <div className="flex items-center gap-2 mt-6 px-3 py-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Lock className="w-3 h-3 shrink-0" />
          API 키는 이 브라우저에만 저장돼요. 서버에는 요약 요청 시에만 전달되고, 저장하지 않아요.
        </div>
      </CardContent>
    </Card>
  );
}
