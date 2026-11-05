import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

/**
 * The signed-in user's row, or `null` when signed out. Throws `USER_NOT_FOUND`
 * if `/auth/callback` failed to create it (see `src/lib/sync-current-user.ts`).
 */
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
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
    });
  },
});
