"use client";

import { useCallback } from "react";
import { ArrowUpCircle, Loader2, Wand2 } from "lucide-react";

interface MessageComposerProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPowerHint?: () => void;
}

export function MessageComposer({
  value,
  placeholder = "Ask anything about your aferição workflows...",
  disabled,
  isLoading,
  onChange,
  onSubmit,
  onPowerHint,
}: MessageComposerProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!disabled && !isLoading) {
          onSubmit();
        }
      }
    },
    [disabled, isLoading, onSubmit],
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={onPowerHint}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Power assist
        </button>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Shift + Enter for newline
        </span>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="h-28 w-full resize-none rounded-3xl bg-transparent px-4 pb-16 pt-4 text-sm text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || isLoading || !value.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-indigo-400/70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                Send
                <ArrowUpCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
