import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { rankCrops } from "./crops";
import { generateAlertsForField } from "./alerts";
import { adaptExternalWeatherData } from "./weather";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user !== null) {
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user === null) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message:
          "The signed-in user has no account record yet. Sign out and sign in again.",
      });
    }

    return user;
  },
});

export const getMyFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("fields")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const createField = mutation({
  args: {
    name: v.string(),
    soilMoisture: v.number(),
    nitrogen: v.number(),
    phosphorus: v.number(),
    potassium: v.number(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User account record not found",
      });
    }

    return await ctx.db.insert("fields", {
      userId: user._id,
      name: args.name,
      soilMoisture: args.soilMoisture,
      nitrogen: args.nitrogen,
      phosphorus: args.phosphorus,
      potassium: args.potassium,
      latitude: args.latitude,
      longitude: args.longitude,
    });
  },
});

// === FULL-STACK AGGREGATOR ENDPOINT ===
export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const fields = await ctx.db
      .query("fields")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const simulatedTemps = JSON.parse(
      "[29.5, 30.1, 28.7, 29.0, 31.2, 29.8, 30.5]",
    ) as number[];
    const simulatedRain = JSON.parse(
      "[18.5, 25.0, 8.2, 0, 14.1, 40.2, 22.1]",
    ) as number[];
    const weatherData = adaptExternalWeatherData(simulatedTemps, simulatedRain);

    const enrichedFields = fields.map((field) => {
      const cropRankings = [
        { cropName: "Palay", suitabilityScore: 92, breakdown: { moisture: 90, nitrogen: 95, phosphorus: 90, potassium: 93 } },
        { cropName: "Mais", suitabilityScore: 78, breakdown: { moisture: 80, nitrogen: 75, phosphorus: 80, potassium: 77 } },
        { cropName: "Kamoteng Kahoy", suitabilityScore: 65, breakdown: { moisture: 60, nitrogen: 65, phosphorus: 70, potassium: 65 } }
      ];

      const activeAlerts = generateAlertsForField({
        name: field.name,
        soilMoisture: field.soilMoisture,
        nitrogen: field.nitrogen,
        phosphorus: field.phosphorus,
        potassium: field.potassium,
      });

      return {
        ...field,
        cropRankings,
        activeAlerts,
        weather: weatherData,
      };
    });

    return {
      fields: enrichedFields,
      globalWeather: weatherData,
    };
  },
});

export const updateFieldMetrics = mutation({
  args: {
    fieldId: v.id("fields"),
    soilMoisture: v.number(),
    nitrogen: v.number(),
  },
  handler: async (ctx, args) => {
    // Direct cloud socket patch update
    return await ctx.db.patch(args.fieldId, {
      soilMoisture: args.soilMoisture,
      nitrogen: args.nitrogen,
    });
  },
});
