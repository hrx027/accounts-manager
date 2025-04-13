import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    totalBalanceSum: v.optional(v.number()), // Current sum of total balance of all accounts (always updated)
    totalBalanceSumBeforePlacingBet: v.optional(v.number()), // Sum before placing a bet
    totalBalanceSumAfterSettlingBets: v.optional(v.number()), // Sum after settling bets
    profitOrLoss: v.optional(v.number()), // Difference between after and before settling
    netProfitOrLoss: v.optional(v.number()), // Accumulated profit or loss over time
    accounts: v.array(
      v.object({
        id: v.string(),
        email: v.string(),
        pno: v.string(),
        adhaarid: v.string(),
        username: v.optional(v.string()), // Optional username
        deviceLocation: v.optional(v.string()), // Optional device/location field
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
            settled: v.optional(v.boolean()), // Whether the bet has been settled
            winningTeam: v.optional(v.string()), // Name of winning team once settled
            payout: v.optional(v.number()), // Amount won from the bet (if any)
          })
        ),
      })
    ),
  }).index("by_clerk_id", ["clerkId"]),
  
  // New table for storing bet history
  betHistory: defineTable({
    userId: v.string(), // Reference to the user who placed the bet
    clerkId: v.string(), // Clerk ID for easy querying
    accountId: v.string(), // ID of the account used to place the bet
    accountEmail: v.string(), // Email of the account
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
    timestamp: v.number(), // For sorting/filtering
    winningTeam: v.string(), // Name of winning team
    payout: v.number(), // Amount won from the bet
    profit: v.number(), // Net profit from the bet (payout - betAmount)
    balanceBeforeBet: v.number(), // Account balance before the bet
    balanceAfterBet: v.number(), // Account balance after the bet
  }).index("by_clerk_id", ["clerkId"]).index("by_timestamp", ["timestamp"]),
});
