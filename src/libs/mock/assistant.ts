export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  role: AssistantRole;
  text: string;
};

export type AssistantContext = {
  crop?: string;
  location?: string;
  weather?: {
    temperature?: number;
    rainfall?: number;
    humidity?: number;
    forecastRainfall?: number;
  };
  soil?: {
    type?: string;
    ph?: number;
    drainage?: string;
    fertility?: string;
  };
};

export function buildMockAssistantReply(
  prompt: string,
  context: AssistantContext = {},
): string {
  const input = prompt.trim();
  const lookup = input.toLowerCase();
  const crop = context.crop ?? "your crop";
  const location = context.location ?? "your field";
  const weather = context.weather;
  const soil = context.soil;

  if (!input) {
    return "I can help compare crop suitability, explain weather trends, or suggest a next step for your field.";
  }

  const suggestions: string[] = [];

  if (lookup.includes("crop") || lookup.includes("plant") || lookup.includes("suit")) {
    suggestions.push(
      `For ${location}, I would start by checking whether ${crop} matches the current conditions and soil profile, then compare it with a lower-risk fallback if the forecast turns wet or hot.`,
    );
  }

  if (weather) {
    const temperature = weather.temperature ?? 22;
    const rainfall = weather.rainfall ?? 0;
    const forecastRainfall = weather.forecastRainfall ?? 0;
    suggestions.push(
      `The current air temperature is about ${temperature.toFixed(1)}°C, with ${rainfall.toFixed(1)} mm of recent rain and ${forecastRainfall.toFixed(1)} mm forecast over the next week.`,
    );
  }

  if (soil) {
    suggestions.push(
      `Soil notes suggest ${soil.type ?? "a mixed soil profile"} with pH ${soil.ph ?? "around neutral"} and ${soil.drainage ?? "moderate"} drainage. Keep an eye on fertility and moisture stress before making a major change.`,
    );
  }

  if (lookup.includes("rain") || lookup.includes("water")) {
    suggestions.push(
      "Water management is the main lever here: protect the root zone, watch for runoff on compacted ground, and prioritize irrigation only when the forecast and soil moisture point to a deficit.",
    );
  }

  if (lookup.includes("risk") || lookup.includes("pest") || lookup.includes("disease")) {
    suggestions.push(
      "For disease or pest pressure, monitor crop stress early, keep the canopy dry where possible, and avoid unnecessary spraying without a clear field diagnosis.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "A good next step is to confirm the crop, field conditions, and any recent weather anomalies before changing irrigation, planting plans, or inputs.",
    );
  }

  return `${suggestions.join(" ")} If you want, I can help narrow this to a crop recommendation, irrigation plan, or risk check.`;
}

export type MockAssistantInstance = {
  history: AssistantMessage[];
  getHistory: () => AssistantMessage[];
  ask: (prompt: string, context?: AssistantContext) => AssistantMessage;
  reset: () => void;
};

export function createMockAssistant(
  initialHistory: AssistantMessage[] = [],
): MockAssistantInstance {
  const history = [...initialHistory];

  return {
    get history() {
      return [...history];
    },
    getHistory() {
      return [...history];
    },
    ask(prompt, context = {}) {
      const userMessage: AssistantMessage = { role: "user", text: prompt };
      history.push(userMessage);
      const replyText = buildMockAssistantReply(prompt, context);
      const reply: AssistantMessage = {
        role: "assistant",
        text: replyText,
      };
      history.push(reply);
      return reply;
    },
    reset() {
      history.length = 0;
    },
  };
}

export const mockAssistant = createMockAssistant();
export const mockAssistantResponse = buildMockAssistantReply;
export const createAssistantMock = createMockAssistant;
export const askMockAssistant = (prompt: string, context?: AssistantContext) =>
  mockAssistant.ask(prompt, context);

export default mockAssistant;
