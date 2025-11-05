import { NextResponse } from "next/server";

import { dispatchChatCompletion } from "@/lib/providers";
import { ChatRequestPayload } from "@/types/chat";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestPayload;

    if (!body?.messages?.length) {
      return NextResponse.json(
        { error: "At least one message is required" },
        { status: 400 },
      );
    }

    if (!body.settings?.providerId) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 },
      );
    }

    const sanitizedMessages = body.messages.map((message) => ({
      role: message.role,
      content: message.content?.slice(0, 32_000) ?? "",
    }));

    if (!sanitizedMessages.every((message) => message.role && message.content)) {
      return NextResponse.json(
        { error: "Each message must include a role and content" },
        { status: 400 },
      );
    }

    const systemPrompt = body.settings.systemPrompt?.trim();

    const payload: ChatRequestPayload = {
      ...body,
      messages: systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }, ...sanitizedMessages]
        : sanitizedMessages,
      settings: body.settings,
    };

    const completion = await dispatchChatCompletion(payload);

    return NextResponse.json(completion);
  } catch (error) {
    console.error("[chat-route]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}
