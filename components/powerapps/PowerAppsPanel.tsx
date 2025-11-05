"use client";

import { useMemo, useState } from "react";
import { Gauge, ListChecks, Sigma, Sparkles, Workflow } from "lucide-react";

import type { PowerAppDefinition } from "@/lib/power-apps";

const iconMap = {
  Gauge,
  ListChecks,
  Sigma,
  Sparkles,
  Workflow,
} as const;

type IconName = keyof typeof iconMap;

interface PowerAppsPanelProps {
  apps: PowerAppDefinition[];
  disabled?: boolean;
  onGenerate: (args: {
    app: PowerAppDefinition;
    values: Record<string, string>;
    prompt: string;
  }) => void;
}

export function PowerAppsPanel({ apps, disabled, onGenerate }: PowerAppsPanelProps) {
  const [selectedApp, setSelectedApp] = useState(apps[0]?.id ?? "");
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>(
    () =>
      apps.reduce<Record<string, Record<string, string>>>((acc, app) => {
        acc[app.id] = {};
        return acc;
      }, {}),
  );
  const [expanded, setExpanded] = useState(true);

  const activeApp = useMemo(
    () => apps.find((item) => item.id === selectedApp) ?? apps[0],
    [apps, selectedApp],
  );

  const IconComponent = iconMap[(activeApp?.icon as IconName) ?? "Sparkles"] ?? Sparkles;

  const handleInputChange = (fieldId: string, value: string) => {
    if (!activeApp) return;
    setFormState((prev) => ({
      ...prev,
      [activeApp.id]: {
        ...prev[activeApp.id],
        [fieldId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (!activeApp) return;
    const values = formState[activeApp.id] ?? {};
    if (activeApp.fields.some((field) => field.required && !values[field.id]?.trim())) {
      // Basic guard; in a richer UI we would surface inline errors.
      return;
    }

    const prompt = activeApp.template(values);

    onGenerate({ app: activeApp, values, prompt });
  };

  if (!activeApp) {
    return null;
  }

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <header
        className="flex cursor-pointer items-center justify-between border-b border-slate-200 px-4 py-3 text-left dark:border-slate-800"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-inner">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Power Apps
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aferição accelerators & smart templates
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </header>

      {expanded && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            {apps.map((app) => {
              const OptionIcon =
                iconMap[(app.icon as IconName) ?? "Sparkles"] ?? Sparkles;
              const isActive = app.id === activeApp.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApp(app.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? "border-transparent bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg dark:from-slate-100 dark:to-slate-300 dark:text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <OptionIcon className="h-4 w-4" />
                  <span className="font-medium">{app.name}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-4 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${activeApp.color} opacity-90 shadow`}>
                <IconComponent className="m-auto h-full w-full p-3 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {activeApp.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeApp.tagline}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {activeApp.description}
                </p>
              </div>
            </div>
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            {activeApp.fields.map((field) => {
              const value = formState[activeApp.id]?.[field.id] ?? "";
              const sharedClasses =
                "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-300/10";

              return (
                <label key={field.id} className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">
                    {field.label}
                    {field.required && <span className="text-rose-500">*</span>}
                  </span>
                  {field.description && (
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                      {field.description}
                    </span>
                  )}
                  {field.type === "textarea" ? (
                    <textarea
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => handleInputChange(field.id, event.target.value)}
                      className={`${sharedClasses} min-h-[120px] resize-y`}
                      disabled={disabled}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(event) => handleInputChange(field.id, event.target.value)}
                      className={sharedClasses}
                      disabled={disabled}
                    />
                  )}
                </label>
              );
            })}

            <button
              type="submit"
              disabled={disabled}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate Insight
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
