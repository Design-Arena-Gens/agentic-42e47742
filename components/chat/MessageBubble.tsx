"use client";

import { useMemo } from "react";
import { Bot, Shield, User } from "lucide-react";

import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";

  const avatar = useMemo(() => {
    if (isAssistant) return <Bot className="h-4 w-4" />;
    if (isSystem) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  }, [isAssistant, isSystem]);

  return (
    <div
      className={`flex w-full gap-3 ${isAssistant || isSystem ? "justify-start" : "justify-end"}`}
    >
      {(isAssistant || isSystem) && (
        <div className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900">
          {avatar}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur ${
          isSystem
            ? "border-dashed border-slate-400 bg-slate-100/80 text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
            : isAssistant
              ? "border-slate-200 bg-white/90 text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              : "rounded-br-none border-indigo-300 bg-indigo-500/90 text-white dark:bg-indigo-500/70"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {!isAssistant && !isSystem && (
        <div className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-indigo-500 text-white shadow-md">
          {avatar}
        </div>
      )}
    </div>
  );
}
