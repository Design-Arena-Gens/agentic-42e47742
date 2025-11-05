"use client";

import { useMemo } from "react";
import { AlertCircle, Brain, SlidersHorizontal } from "lucide-react";

import type { ChatSettings } from "@/types/chat";
import type { ProviderAvailability } from "@/types/providers";

interface ModelSettingsPanelProps {
  providers: ProviderAvailability[];
  settings: ChatSettings;
  disabled?: boolean;
  onChange: (settings: Partial<ChatSettings>) => void;
}

export function ModelSettingsPanel({
  providers,
  settings,
  disabled,
  onChange,
}: ModelSettingsPanelProps) {
  const activeProvider = useMemo(
    () => providers.find((item) => item.id === settings.providerId),
    [providers, settings.providerId],
  );

  return (
    <aside className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <header className="flex items-center gap-3 border-b border-slate-200 pb-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-100">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/90 text-white shadow-md">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        Controls
      </header>

      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        Provider
        <select
          value={settings.providerId}
          onChange={(event) => onChange({ providerId: event.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-300 dark:focus:ring-indigo-300/20"
          disabled={disabled}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id} disabled={!provider.enabled}>
              {provider.label} {provider.badge ? `(${provider.badge})` : ""}
            </option>
          ))}
        </select>
        {activeProvider && !activeProvider.enabled && (
          <p className="flex items-center gap-1 text-[11px] font-normal text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {activeProvider.disabledReason}
          </p>
        )}
      </label>

      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        Model
        <select
          value={settings.modelId}
          onChange={(event) => onChange({ modelId: event.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-300 dark:focus:ring-indigo-300/20"
          disabled={disabled}
        >
          {activeProvider?.models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          )) ?? <option value="">Select model</option>}
        </select>
        {activeProvider && (
          <a
            href={activeProvider.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-normal text-indigo-500 underline decoration-dotted hover:text-indigo-600"
          >
            Manage in console →
          </a>
        )}
      </label>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950/60">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Brain className="h-3.5 w-3.5" />
          Sampling
        </h3>

        <SliderRow
          label="Temperature"
          value={settings.temperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(value) => onChange({ temperature: value })}
        />
        <SliderRow
          label="Top P"
          value={settings.topP}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => onChange({ topP: value })}
        />
        <SliderRow
          label="Presence Penalty"
          value={settings.presencePenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(value) => onChange({ presencePenalty: value })}
        />
        <SliderRow
          label="Frequency Penalty"
          value={settings.frequencyPenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(value) => onChange({ frequencyPenalty: value })}
        />
      </div>

      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        Max Tokens
        <input
          type="number"
          value={settings.maxTokens}
          onChange={(event) => onChange({ maxTokens: Number(event.target.value) })}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-300 dark:focus:ring-indigo-300/20"
          disabled={disabled}
          min={16}
          max={64_000}
        />
      </label>

      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        Response Format
        <select
          value={settings.responseFormat}
          onChange={(event) =>
            onChange({ responseFormat: event.target.value as ChatSettings["responseFormat"] })
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-300 dark:focus:ring-indigo-300/20"
          disabled={disabled}
        >
          <option value="text">Natural language</option>
          <option value="json">JSON object</option>
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        System Prompt
        <textarea
          value={settings.systemPrompt}
          onChange={(event) => onChange({ systemPrompt: event.target.value })}
          placeholder="Define tone, domain-knowledge, or compliance boundaries."
          className="min-h-[120px] flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-300 dark:focus:ring-indigo-300/20"
          disabled={disabled}
        />
      </label>
    </aside>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="mb-3 flex flex-col gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 last:mb-0">
      <div className="flex items-center justify-between text-slate-400">
        <span>{label}</span>
        <span className="text-xs font-semibold text-slate-600">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}
