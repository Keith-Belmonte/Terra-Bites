import { describe, expect, it } from "vitest";
import { estimateSoilTexture } from "@/lib/soil-texture.ts";

describe("estimateSoilTexture", () => {
  it("uses the feel to distinguish weak-ribbon estimates", () => {
    expect(estimateSoilTexture("gritty", "short").type).toBe("Sandy loam");
    expect(estimateSoilTexture("silky", "none").type).toBe("Silt loam");
    expect(estimateSoilTexture("balanced", "short").type).toBe("Loam");
  });

  it("uses longer ribbons as an indicator of clay-rich texture", () => {
    expect(estimateSoilTexture("gritty", "medium").type).toBe("Clay loam");
    expect(estimateSoilTexture("silky", "long").explanation).toContain(
      "rough match",
    );
  });
});
