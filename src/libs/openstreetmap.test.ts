import { describe, expect, test } from "vitest";
import {
  distanceInKilometers,
  parseFertilizerPlaces,
} from "@/lib/openstreetmap.ts";

describe("OpenStreetMap supplier data", () => {
  test("parses tagged agricultural suppliers and way center coordinates", () => {
    const places = parseFertilizerPlaces({
      elements: [
        {
          type: "node",
          id: 12,
          lat: 13.1,
          lon: 123.7,
          tags: { name: "Farm Supply", shop: "agrarian" },
        },
        {
          type: "way",
          id: 34,
          center: { lat: 13.2, lon: 123.8 },
          tags: { name: "Fertilizer Plant" },
        },
        {
          type: "node",
          id: 56,
          lat: 13.3,
          lon: 123.9,
          tags: { name: "General Store", shop: "convenience" },
        },
      ],
    });

    expect(places).toEqual([
      {
        id: "node/12",
        name: "Farm Supply",
        category: "Agricultural supply shop",
        latitude: 13.1,
        longitude: 123.7,
      },
      {
        id: "way/34",
        name: "Fertilizer Plant",
        category: "Fertilizer listing",
        latitude: 13.2,
        longitude: 123.8,
      },
    ]);
  });

  test("rejects malformed responses and calculates nearby distances", () => {
    expect(() => parseFertilizerPlaces({})).toThrow(
      "missing its elements list",
    );
    expect(
      distanceInKilometers(
        { latitude: 13.1, longitude: 123.7 },
        { latitude: 13.1, longitude: 123.7 },
      ),
    ).toBe(0);
    expect(
      distanceInKilometers(
        { latitude: 13.1, longitude: 123.7 },
        { latitude: 13.1, longitude: 123.8 },
      ),
    ).toBeGreaterThan(10);
  });
});
