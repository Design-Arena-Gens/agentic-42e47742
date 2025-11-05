export type ProviderId = "openai" | "anthropic" | "azure-openai" | "ollama";

export interface ProviderModel {
  id: string;
  label: string;
  description?: string;
  contextWindow?: number;
  capabilities?: string[];
}

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  badge?: string;
  description: string;
  link: string;
  models: ProviderModel[];
  env?: string[];
  defaultModel: string;
}

export interface ProviderAvailability extends ProviderConfig {
  enabled: boolean;
  disabledReason?: string;
}
