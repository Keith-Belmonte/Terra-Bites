import type { SoilType } from "@/lib/mock/crops.ts";

export type SoilFeel = "gritty" | "silky" | "balanced";
export type SoilRibbon = "none" | "short" | "medium" | "long";

export type SoilTextureEstimate = {
  type: SoilType;
  explanation: string;
};

export function estimateSoilTexture(
  feel: SoilFeel,
  ribbon: SoilRibbon,
): SoilTextureEstimate {
  if (ribbon === "medium") {
    return {
      type: "Clay loam",
      explanation:
        "A ribbon around 2.5–5 cm can indicate more clay. Clay loam is the closest texture category in TerraBites.",
    };
  }

  if (ribbon === "long") {
    return {
      type: "Clay loam",
      explanation:
        "A ribbon longer than 5 cm can indicate very clay-rich soil. Clay loam is only a rough match in TerraBites; a soil lab or local agriculture office can distinguish heavier clay.",
    };
  }

  if (feel === "gritty") {
    return {
      type: "Sandy loam",
      explanation:
        "A gritty feel with no ribbon or a short ribbon can indicate a sandier soil.",
    };
  }

  if (feel === "silky") {
    return {
      type: "Silt loam",
      explanation:
        "A smooth or floury feel with no ribbon or a short ribbon can indicate a silt-rich soil.",
    };
  }

  return {
    type: "Loam",
    explanation:
      "A balanced feel with no ribbon or a short ribbon can indicate a loam-like soil.",
  };
}
