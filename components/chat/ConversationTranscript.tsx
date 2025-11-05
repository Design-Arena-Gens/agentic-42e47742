"use client";

import type { ChatMessage } from "@/types/chat";

import { MessageBubble } from "./MessageBubble";

interface ConversationTranscriptProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ConversationTranscript({ messages, isLoading }: ConversationTranscriptProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto rounded-3xl border border-transparent bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-inner dark:from-slate-900 dark:via-slate-950 dark:to-slate-900/80">
      {messages.length === 0 && (
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Ready to orchestrate your aferição insights
          </h2>
          <p>
            Ask a question, generate a calibration brief, or run a variance analysis across
            your measurement runs. Select a model, tune the controls, and deploy a power app
            to accelerate your workflow.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="mx-auto rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-500 shadow dark:bg-slate-900/50 dark:text-slate-300">
          Thinking...
        </div>
      )}
    </div>
  );
}
