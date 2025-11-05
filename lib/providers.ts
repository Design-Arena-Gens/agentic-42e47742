import "server-only";

import { ChatCompletionResponse, ChatRequestPayload } from "@/types/chat";
import type { ProviderAvailability, ProviderConfig, ProviderId } from "@/types/providers";

const providerConfigs: ProviderConfig[] = [
  {
    id: "openai",
    label: "OpenAI",
    badge: "Popular",
    description: "GPT-4 family models with multimodal capabilities and high quality responses.",
    link: "https://platform.openai.com/",
    models: [
      {
        id: "gpt-4o-mini",
        label: "GPT-4o Mini",
        description: "Balanced for cost and quality, great default assistant.",
        contextWindow: 128_000,
      },
      {
        id: "gpt-4o",
        label: "GPT-4o",
        description: "Flagship GPT-4o model with advanced reasoning.",
        contextWindow: 128_000,
      },
      {
        id: "gpt-4.1-mini",
        label: "GPT-4.1 Mini",
        description: "Updated GPT-4.1 mini with improved grounding.",
      },
      {
        id: "o4-mini",
        label: "o4 Mini",
        description: "Reasoning optimized o-series model.",
      },
    ],
    env: ["OPENAI_API_KEY"],
    defaultModel: "gpt-4o-mini",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    badge: "Safety",
    description: "Claude 3 models ideal for long context and compliance heavy workloads.",
    link: "https://console.anthropic.com/",
    models: [
      {
        id: "claude-3-5-sonnet-20240620",
        label: "Claude 3.5 Sonnet",
        description: "Top-tier reasoning with tool use.",
        contextWindow: 200_000,
      },
      {
        id: "claude-3-5-haiku-20241022",
        label: "Claude 3.5 Haiku",
        description: "Fast, lower-latency Claude with great quality.",
      },
      {
        id: "claude-3-opus-20240229",
        label: "Claude 3 Opus",
        description: "High-end Claude for sophisticated narratives.",
      },
    ],
    env: ["ANTHROPIC_API_KEY"],
    defaultModel: "claude-3-5-sonnet-20240620",
  },
  {
    id: "azure-openai",
    label: "Azure OpenAI",
    description: "Enterprise deployment of OpenAI models hosted on Azure with regional control.",
    link: "https://learn.microsoft.com/azure/ai-services/openai/",
    models: [
      {
        id: "gpt-4o",
        label: "GPT-4o (Azure Deployment)",
        description: "Use your provisioned GPT-4o deployment.",
      },
      {
        id: "gpt-35-turbo",
        label: "GPT-3.5 Turbo",
        description: "Legacy, cost-effective Azure deployment.",
      },
    ],
    env: ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_DEPLOYMENT"],
    defaultModel: "gpt-4o",
  },
  {
    id: "ollama",
    label: "Ollama",
    badge: "Self-hosted",
    description: "Run open-source models locally via Ollama with zero external dependency.",
    link: "https://ollama.com/",
    models: [
      {
        id: "llama3.1",
        label: "Llama 3.1",
        description: "Meta's Llama 3.1 8B general assistant.",
      },
      {
        id: "mistral",
        label: "Mistral",
        description: "Mistral 7B value focused.",
      },
      {
        id: "phi3",
        label: "Phi-3",
        description: "Microsoft's Phi-3 mini for on-device inference.",
      },
    ],
    defaultModel: "llama3.1",
  },
];

export const getProviderCatalogue = (): ProviderConfig[] => providerConfigs;

export const getProviderAvailability = (): ProviderAvailability[] => {
  return providerConfigs.map((provider) => {
    if (!provider.env?.length) {
      return { ...provider, enabled: true } satisfies ProviderAvailability;
    }

    const missing = provider.env.filter((envVar) => !process.env[envVar]);

    if (missing.length === 0) {
      return { ...provider, enabled: true } satisfies ProviderAvailability;
    }

    return {
      ...provider,
      enabled: false,
      disabledReason: `Missing environment variables: ${missing.join(", ")}`,
    } satisfies ProviderAvailability;
  });
};

export async function dispatchChatCompletion(
  payload: ChatRequestPayload,
): Promise<ChatCompletionResponse> {
  const provider = providerConfigs.find(
    (item) => item.id === (payload.settings.providerId as ProviderId),
  );

  if (!provider) {
    throw new Error(`Unsupported provider: ${payload.settings.providerId}`);
  }

  if (provider.env?.length) {
    const missing = provider.env.filter((envVar) => !process.env[envVar]);
    if (missing.length > 0) {
      throw new Error(
        `Provider ${provider.label} is not configured. Missing environment variables: ${missing.join(", ")}`,
      );
    }
  }

  switch (provider.id) {
    case "openai":
      return callOpenAI(payload);
    case "anthropic":
      return callAnthropic(payload);
    case "azure-openai":
      return callAzureOpenAI(payload);
    case "ollama":
      return callOllama(payload);
    default:
      throw new Error(`Provider ${provider.id} not implemented`);
  }
}

const DEFAULT_TIMEOUT_MS = 60_000;

async function callOpenAI(payload: ChatRequestPayload): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: payload.settings.modelId,
        temperature: payload.settings.temperature,
        max_tokens: payload.settings.maxTokens || undefined,
        top_p: payload.settings.topP,
        presence_penalty: payload.settings.presencePenalty,
        frequency_penalty: payload.settings.frequencyPenalty,
        response_format:
          payload.settings.responseFormat === "json" ? { type: "json_object" } : undefined,
        messages: payload.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    return {
      message: {
        role: choice?.message?.role ?? "assistant",
        content: choice?.message?.content ?? "",
      },
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      raw: data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAnthropic(payload: ChatRequestPayload): Promise<ChatCompletionResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const systemMessages = payload.messages.filter((msg) => msg.role === "system");
    const nonSystemMessages = payload.messages.filter((msg) => msg.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: payload.settings.modelId,
        max_tokens: payload.settings.maxTokens || 1024,
        temperature: payload.settings.temperature,
        top_p: payload.settings.topP,
        system: systemMessages.map((msg) => msg.content).join("\n\n"),
        messages: nonSystemMessages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: [
            {
              type: "text",
              text: msg.content,
            },
          ],
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "";
    return {
      message: {
        role: "assistant",
        content,
      },
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens:
              (data.usage.input_tokens ?? 0) +
              (data.usage.output_tokens ?? 0),
          }
        : undefined,
      raw: data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAzureOpenAI(payload: ChatRequestPayload): Promise<ChatCompletionResponse> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      "Azure OpenAI is not configured. Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = new URL(
      `/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      endpoint,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        messages: payload.messages,
        temperature: payload.settings.temperature,
        max_tokens: payload.settings.maxTokens || undefined,
        top_p: payload.settings.topP,
        presence_penalty: payload.settings.presencePenalty,
        frequency_penalty: payload.settings.frequencyPenalty,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    return {
      message: {
        role: choice?.message?.role ?? "assistant",
        content: choice?.message?.content ?? "",
      },
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      raw: data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callOllama(payload: ChatRequestPayload): Promise<ChatCompletionResponse> {
  const endpoint = process.env.OLLAMA_API_URL ?? "http://localhost:11434";

  const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: payload.settings.modelId,
      options: {
        temperature: payload.settings.temperature,
        top_p: payload.settings.topP,
        num_predict: payload.settings.maxTokens || undefined,
        presence_penalty: payload.settings.presencePenalty,
        frequency_penalty: payload.settings.frequencyPenalty,
      },
      messages: payload.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const message = Array.isArray(data.message)
    ? data.message.map((part: { text?: string }) => part.text ?? "").join("\n")
    : data.message?.content ?? data.response ?? "";

  return {
    message: {
      role: "assistant",
      content: message,
    },
    raw: data,
  };
}
