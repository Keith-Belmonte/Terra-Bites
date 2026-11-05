import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
    fields: defineTable({
    userId: v.string(),
    name: v.string(),
    soilMoisture: v.number(),
    nitrogen: v.number(),
    phosphorus: v.number(),
    potassium: v.number(),
  }),

});
