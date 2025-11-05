"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CircleDashed,
  GitBranch,
  History,
  Layers,
  LayoutDashboard,
  Loader2,
  PlugZap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ConversationTranscript } from "@/components/chat/ConversationTranscript";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { PowerAppsPanel } from "@/components/powerapps/PowerAppsPanel";
import { ModelSettingsPanel } from "@/components/settings/ModelSettingsPanel";
import { powerApps } from "@/lib/power-apps";
import type { ChatCompletionResponse, ChatMessage, ChatSettings } from "@/types/chat";
import type { ProviderAvailability } from "@/types/providers";

interface ProvidersResponse {
  providers: ProviderAvailability[];
}

const defaultSettings: ChatSettings = {
  providerId: "openai",
  modelId: "gpt-4o-mini",
  temperature: 0.8,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: 4096,
  systemPrompt:
    "You are Atlas, an AI copilot specialized in aferição workflows, metrology audits, and calibration analytics. Respond with practical, compliance-minded guidance.",
  responseFormat: "text",
};

export default function Home() {
  const [providers, setProviders] = useState<ProviderAvailability[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProviders = async () => {
      try {
        setProvidersLoading(true);
        const response = await fetch("/api/providers");
        if (!response.ok) {
          throw new Error("Failed to load model catalogue");
        }
        const data = (await response.json()) as ProvidersResponse;
        if (!active) return;

        setProviders(data.providers);

        const enabledDefault =
          data.providers.find((provider) => provider.id === settings.providerId && provider.enabled) ??
          data.providers.find((provider) => provider.enabled) ??
          data.providers[0];

        if (enabledDefault) {
          setSettings((prev) => ({
            ...prev,
            providerId: enabledDefault.id,
            modelId: enabledDefault.defaultModel,
          }));
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load providers");
        }
      } finally {
        if (active) {
          setProvidersLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      active = false;
    };
  }, [settings.providerId]);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === settings.providerId),
    [providers, settings.providerId],
  );

  const handleSettingsChange = (partial: Partial<ChatSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (partial.providerId && partial.providerId !== prev.providerId) {
        const provider = providers.find((item) => item.id === partial.providerId);
        if (provider) {
          next.modelId = provider.defaultModel;
        }
      }
      if (partial.modelId && activeProvider) {
        const validModel = activeProvider.models.some((model) => model.id === partial.modelId);
        if (!validModel) {
          next.modelId = activeProvider.defaultModel;
        }
      }
      return next;
    });
  };

  const sendChat = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      let snapshot: ChatMessage[] = [];
      setMessages((prev) => {
        snapshot = [...prev, newMessage];
        return snapshot;
      });

      setInput("");
      setIsSending(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: snapshot.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            settings,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Chat completion failed");
        }

        const data = (await response.json()) as ChatCompletionResponse;

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: data.message.role ?? "assistant",
          content: data.message.content ?? "",
          createdAt: new Date().toISOString(),
          annotations: data.usage,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to complete request");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "I encountered an error completing that request. Please review your configuration or try again.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [settings],
  );

  const handleComposerSubmit = () => {
    if (providersLoading || !activeProvider?.enabled) {
      setError("Selected provider is not ready. Check configuration.");
      return;
    }
    sendChat(input);
  };

  const handlePowerAppGenerate = ({
    app,
    prompt,
  }: {
    app: (typeof powerApps)[number];
    prompt: string;
  }) => {
    if (providersLoading || !activeProvider?.enabled) {
      setError("Configure a provider before launching power apps.");
      return;
    }
    if (app.suggestedSystemPrompt) {
      setSettings((prev) => ({
        ...prev,
        systemPrompt: app.suggestedSystemPrompt ?? prev.systemPrompt,
      }));
    }
    sendChat(prompt);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-10 py-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                Agentic Aferição Studio
              </h1>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                ChatGPT-class orchestration with metrology controls
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500 md:flex">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              Compliance-ready
            </span>
            <span className="inline-flex items-center gap-2">
              <PlugZap className="h-4 w-4" />
              Multi-vendor
            </span>
            <span className="inline-flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Power apps
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-6 lg:px-10">
        <div className="hidden w-72 flex-shrink-0 flex-col gap-4 lg:flex">
          <ModelSettingsPanel
            providers={providers}
            settings={settings}
            onChange={handleSettingsChange}
            disabled={isSending}
          />
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-100">
                <History className="h-4 w-4" />
                Recent runs
              </span>
              <GitBranch className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 leading-relaxed">
              Conversation history persists locally. Export transcripts, track token usage,
              and branch scenarios for peer review.
            </p>
          </div>
        </div>

        <section className="flex min-h-[calc(100vh-200px)] flex-1 flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm text-rose-700 shadow dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-indigo-100/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-200">
                <LayoutDashboard className="h-4 w-4" />
                Workspace
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {activeProvider?.label ?? "Loading provider"} ·{" "}
                {providersLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Resolving
                  </span>
                ) : activeProvider?.enabled ? (
                  "Ready"
                ) : (
                  "Awaiting configuration"
                )}
              </span>
              <span className="inline-flex items-center gap-2">
                <CircleDashed className="h-4 w-4" />
                Temp {settings.temperature.toFixed(1)}
              </span>
            </div>

            <ConversationTranscript messages={messages} isLoading={isSending} />

            <MessageComposer
              value={input}
              onChange={setInput}
              onSubmit={handleComposerSubmit}
              isLoading={isSending}
              disabled={providersLoading || !activeProvider?.enabled}
              onPowerHint={() => setInput((prev) => prev || "Run a calibration variance summary.")}
            />
          </div>
        </section>

        <div className="hidden w-80 flex-shrink-0 lg:flex">
          <PowerAppsPanel apps={powerApps} disabled={isSending} onGenerate={handlePowerAppGenerate} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 px-6 py-4 text-xs text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Agentic Aferição Studio</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <PlugZap className="h-3.5 w-3.5" />
              Bring your own keys
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Power apps accelerate calibration
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
