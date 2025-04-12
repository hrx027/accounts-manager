import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    accounts: v.array(
      v.object({
        id: v.string(),
        email: v.string(),
        pno: v.string(),
        adhaarid: v.string(),
        totalBalance: v.number(),
        bets: v.array(
          v.object({
            team1: v.object({
              name: v.string(),
              odds: v.number(),
            }),
            team2: v.object({
              name: v.string(),
              odds: v.number(),
            }),
            dividedBy: v.number(),
            betAmount: v.number(), // Amount placed for this bet
            timestamp: v.number(), // optional, for sorting/filtering
          })
        ),
      })
    ),
  }).index("by_clerk_id", ["clerkId"]),
});
