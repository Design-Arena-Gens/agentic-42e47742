# Agentic Aferição Studio

Agentic Aferição Studio is a ChatGPT-class workspace tailored for calibration and aferição teams. It delivers a multi-vendor model switcher, granular inference controls, and verticalized “power apps” that turn raw measurement inputs into compliant, audit-ready narratives.

## Features

- **Multi-vendor orchestration** – Bring your own keys for OpenAI, Anthropic, Azure OpenAI, or self-hosted Ollama.
- **Granular controls** – Tune temperature, top-p, penalties, max tokens, and response format per run.
- **Aferição power apps** – Launch calibration briefs, QA checklists, and variance analyzers with structured forms.
- **System prompt governance** – Persist domain-specific operating guidance and override per scenario.
- **Responsive cockpit UI** – Chat transcript, composer, controls, and power apps in a tri-pane layout ready for Vercel.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the workspace.

## Environment Configuration

Set the following environment variables (only the providers you intend to use are required):

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=yourDeploymentName
OLLAMA_API_URL=http://localhost:11434
```

> Tip: Add a `.env.local` file when running locally. On Vercel, configure these under Project Settings → Environment Variables.

## Deploy

The project is Vercel-ready. Build locally before deploying:

```bash
npm run build
```

Then deploy with the provided CLI command:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-42e47742
```

Once DNS propagates, validate the production URL with:

```bash
curl https://agentic-42e47742.vercel.app
```

## License

MIT © Agentic Aferição Studio
