export interface PowerAppField {
  id: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "textarea" | "number" | "json";
  required?: boolean;
}

export interface PowerAppDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  fields: PowerAppField[];
  template: (values: Record<string, string>) => string;
  suggestedSystemPrompt?: string;
}

export const powerApps: PowerAppDefinition[] = [
  {
    id: "calibration-brief",
    name: "Calibration Brief",
    tagline: "Summarize instrument aferição results",
    description:
      "Generate a technician-friendly narrative and recommended actions for the latest calibration or aferição session.",
    icon: "Gauge",
    color: "from-sky-500 to-cyan-500",
    suggestedSystemPrompt:
      "You are a calibration specialist that prepares precise, audit-ready documentation for engineering teams. Be concise, objective, and highlight any risk immediately.",
    fields: [
      {
        id: "instrument",
        label: "Instrument",
        placeholder: "Ultrasonic flow meter FM-882",
        required: true,
      },
      {
        id: "environment",
        label: "Environment Conditions",
        placeholder: "Ambient 23ºC, humidity 42%, altitude 620m",
        type: "textarea",
      },
      {
        id: "measurements",
        label: "Measurement Set",
        placeholder: "Ref 10.000 / Read 10.015 / Error +0.15% ...",
        description: "Comma separated or multi-line list of reference vs measured values.",
        type: "textarea",
        required: true,
      },
      {
        id: "tolerance",
        label: "Tolerance Window",
        placeholder: "±0.25%",
      },
      {
        id: "notes",
        label: "Technician Notes",
        placeholder: "Noise on channel B, repeated aferição due to drift.",
        type: "textarea",
      },
    ],
    template: (values) => {
      const sections: string[] = [
        `Instrument: ${values.instrument ?? "N/A"}`,
        values.environment ? `Environment: ${values.environment}` : "",
        `Measurements:\n${values.measurements ?? "N/A"}`,
        values.tolerance ? `Tolerance: ${values.tolerance}` : "",
        values.notes ? `Field Notes: ${values.notes}` : "",
      ].filter(Boolean);

      return [
        "Prepare a calibration briefing using the data below. Include:",
        "1. Compliance verdict vs tolerance",
        "2. Notable deviations & root causes",
        "3. Recommended follow-up actions",
        "4. Summary paragraph for client report",
        "",
        sections.join("\n"),
      ].join("\n");
    },
  },
  {
    id: "afericao-checklist",
    name: "Aferição Checklist QA",
    tagline: "Validate measurement runs step-by-step",
    description:
      "Create an actionable checklist to oversee aferição workflows, ensuring every control point is validated before sign-off.",
    icon: "ListChecks",
    color: "from-emerald-500 to-lime-500",
    fields: [
      {
        id: "workflow",
        label: "Workflow Stage",
        placeholder: "Receiving inspection, sensor setup, baseline capture",
        type: "textarea",
        required: true,
      },
      {
        id: "risks",
        label: "Known Risks",
        placeholder: "Sensor saturation, temperature drift",
        type: "textarea",
      },
      {
        id: "standards",
        label: "Standards or SOP references",
        placeholder: "ISO/IEC 17025, In-house SOP-22",
        type: "textarea",
      },
    ],
    template: (values) => {
      return [
        "Design a verification checklist for the aferição workflow described below.",
        "The checklist should include:",
        "- Sequential tasks grouped by phase",
        "- Acceptance criteria for each task",
        "- Responsible role",
        "- Automation opportunities",
        "- Risk mitigation referencing provided standards",
        "",
        `Workflow phases:\n${values.workflow ?? "N/A"}`,
        values.risks ? `Risks: ${values.risks}` : "",
        values.standards ? `Standards: ${values.standards}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    },
  },
  {
    id: "variance-analyzer",
    name: "Variance Analyzer",
    tagline: "Drill into measurement deviations",
    description:
      "Explain the variance across aferição runs and suggest corrective actions backed by statistical reasoning.",
    icon: "Sigma",
    color: "from-fuchsia-500 to-purple-500",
    fields: [
      {
        id: "datasetSummary",
        label: "Dataset Summary",
        placeholder:
          "Run A: mean 10.2, sd 0.3\nRun B: mean 10.8, sd 0.6\nReference: 10.0",
        type: "textarea",
        required: true,
      },
      {
        id: "rootHypothesis",
        label: "Hypothesized Root Causes",
        placeholder: "Sensor linearity drift, operator misalignment",
        type: "textarea",
      },
      {
        id: "constraints",
        label: "Constraints",
        placeholder: "Cannot halt production, only adjust sensor",
      },
    ],
    template: (values) => {
      return [
        "You are a metrology specialist analysing aferição variance.",
        "Provide:",
        "1. Variance explanation referencing the dataset",
        "2. Probability-weighted root-cause table",
        "3. Mitigation plan ranked by impact vs effort",
        values.constraints ? `Constraints to respect: ${values.constraints}` : "",
        "",
        `Dataset:\n${values.datasetSummary ?? "N/A"}`,
        values.rootHypothesis ? `Initial hypotheses: ${values.rootHypothesis}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    },
  },
];
