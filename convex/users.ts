import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
    args:{
        name:v.string(),
        email:v.string(),
        image:v.string(),
        clerkId:v.string(),
    },
    handler:async (ctx, args) => {

        const existingUser = await ctx.db.query("users").filter(q => q.eq(q.field("_id"), args.clerkId)).first();

        if(existingUser){
            return;
        }

        await ctx.db.insert("users", {
            ...args,
            accounts:[],
        });
    }
});

export const getUserAccounts = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            return [];
        }
        
        return user.accounts;
    }
});

export const addUserAccount = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        pno: v.string(),
        adhaarid: v.string(),
        username: v.optional(v.string()),
        deviceLocation: v.optional(v.string()),
        totalBalance: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const newAccount = {
            id: crypto.randomUUID(),
            email: args.email,
            pno: args.pno,
            adhaarid: args.adhaarid,
            username: args.username,
            deviceLocation: args.deviceLocation,
            totalBalance: args.totalBalance,
            bets: [],
        };
        
        const updatedAccounts = [...user.accounts, newAccount];
        
        // Calculate new total balance sum
        const totalBalanceSum = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSum
        });
        
        return newAccount;
    }
});

export const updateUserAccount = mutation({
    args: {
        clerkId: v.string(),
        accountId: v.string(),
        email: v.string(),
        pno: v.string(),
        adhaarid: v.string(),
        username: v.optional(v.string()),
        deviceLocation: v.optional(v.string()),
        totalBalance: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const accountIndex = user.accounts.findIndex((account: any) => account.id === args.accountId);
        
        if (accountIndex === -1) {
            throw new Error("Account not found");
        }
        
        // Create updated account
        const updatedAccount = {
            ...user.accounts[accountIndex],
            email: args.email,
            pno: args.pno,
            adhaarid: args.adhaarid,
            username: args.username,
            deviceLocation: args.deviceLocation,
            totalBalance: args.totalBalance,
        };
        
        // Create new accounts array with the updated account
        const updatedAccounts = [...user.accounts];
        updatedAccounts[accountIndex] = updatedAccount;
        
        // Calculate new total balance sum
        const totalBalanceSum = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        // Update user with new accounts array and total balance sum
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSum
        });
        
        return updatedAccount;
    }
});

export const deleteUserAccount = mutation({
    args: {
        clerkId: v.string(),
        accountId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const accountIndex = user.accounts.findIndex((account: any) => account.id === args.accountId);
        
        if (accountIndex === -1) {
            throw new Error("Account not found");
        }
        
        // Create new accounts array without the deleted account
        const updatedAccounts = user.accounts.filter((account: any) => account.id !== args.accountId);
        
        // Calculate new total balance sum
        const totalBalanceSum = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        // Update user with new accounts array
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSum
        });
        
        return true;
    }
});

export const placeBet = mutation({
    args: {
        clerkId: v.string(),
        accountIds: v.array(v.string()),
        teamSelections: v.array(v.string()),
        team1: v.object({
            name: v.string(),
            odds: v.number(),
        }),
        team2: v.object({
            name: v.string(),
            odds: v.number(),
        }),
        dividedBy: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        // Calculate total balance sum before placing bets
        const totalBalanceSum = user.accounts.reduce((sum, account) => sum + account.totalBalance, 0);
        
        const timestamp = Date.now();
        
        // Update each selected account
        const updatedAccounts = [...user.accounts];
        
        for (let i = 0; i < args.accountIds.length; i++) {
            const accountId = args.accountIds[i];
            const teamSelection = args.teamSelections[i];
            
            const accountIndex = user.accounts.findIndex((account: any) => account.id === accountId);
            
            if (accountIndex === -1) {
                throw new Error(`Account with ID ${accountId} not found`);
            }
            
            // Calculate the bet amount based on team selection and odds
            const betAmount = teamSelection === "team1" 
                ? args.dividedBy / args.team1.odds 
                : args.dividedBy / args.team2.odds;
            
            // Create bet object according to schema
            const newBet = {
                team1: args.team1,
                team2: args.team2,
                dividedBy: args.dividedBy,
                betAmount: betAmount,
                timestamp: timestamp
            };
            
            // Store team selection by modifying the team odds
            // The selected team keeps its odds, the non-selected team gets odds set to 0
            if (teamSelection === "team1") {
                newBet.team2 = { ...newBet.team2, odds: 0 };
            } else {
                newBet.team1 = { ...newBet.team1, odds: 0 };
            }
            
            // Create updated account with new bet
            const updatedAccount = {
                ...user.accounts[accountIndex],
                bets: [...user.accounts[accountIndex].bets, newBet],
                // Deduct calculated bet amount from total balance
                totalBalance: user.accounts[accountIndex].totalBalance - betAmount
            };
            
            updatedAccounts[accountIndex] = updatedAccount;
        }
        
        // Calculate new total balance sum after placing bets
        const updatedTotalBalanceSum = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        // Update user with new accounts, store both balances
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSumBeforePlacingBet: totalBalanceSum,
            totalBalanceSum: updatedTotalBalanceSum
        });
        
        return true;
    }
});

export const settleBet = mutation({
    args: {
        clerkId: v.string(),
        matchId: v.string(),
        winningTeam: v.string(),
        losingTeamHitSix: v.boolean(),
        cashoutAccounts: v.optional(v.array(v.object({
            accountId: v.string(),
            amount: v.number()
        }))),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        // Get team names from matchId
        const [team1Name, team2Name] = args.matchId.split("-vs-");
        if (!team1Name || !team2Name) {
            throw new Error("Invalid match ID");
        }
        
        // Create a map of account IDs to cashout amounts for quick lookup
        const cashoutMap = new Map();
        if (args.cashoutAccounts) {
            args.cashoutAccounts.forEach(account => {
                cashoutMap.set(account.accountId, account.amount);
            });
        }
        
        // Find all accounts that have bets on this match
        const updatedAccounts = [...user.accounts];
        let settledBetsCount = 0;
        
        for (let i = 0; i < user.accounts.length; i++) {
            const account = user.accounts[i];
            
            // Find all bets for this match in the account
            const matchBets = account.bets.filter((bet: any) => 
                (bet.team1.name === team1Name && bet.team2.name === team2Name) ||
                (bet.team1.name === team2Name && bet.team2.name === team1Name)
            );
            
            for (const bet of matchBets) {
                // Determine the selected team
                let selectedTeam;
                let selectedTeamName;
                
                if (bet.team1.odds > 0 && bet.team2.odds === 0) {
                    selectedTeam = bet.team1;
                    selectedTeamName = bet.team1.name;
                } else if (bet.team2.odds > 0 && bet.team1.odds === 0) {
                    selectedTeam = bet.team2;
                    selectedTeamName = bet.team2.name;
                } else {
                    continue; // Skip invalid bets
                }
                
                // Initialize win amount
                let winAmount = 0;
                
                // Check if this account is being cashed out
                const isCashedOut = cashoutMap.has(account.id);
                
                if (isCashedOut) {
                    // If account is being cashed out, they get the specified cashout amount
                    winAmount = cashoutMap.get(account.id);
                } else {
                    // If not being cashed out, apply normal winning/losing team logic
                    if (selectedTeamName === args.winningTeam) {
                        // Winning team gets their bet amount * odds
                        winAmount = bet.betAmount * selectedTeam.odds;
                    } else if (args.losingTeamHitSix) {
                        // Losing team that hit six gets their bet amount * odds
                        winAmount = bet.betAmount * selectedTeam.odds;
                    }
                }
                
                // Update account balance
                if (winAmount > 0) {
                    const balanceBeforeBet = updatedAccounts[i].totalBalance;
                    updatedAccounts[i].totalBalance += winAmount;
                    const balanceAfterBet = updatedAccounts[i].totalBalance;
                    settledBetsCount++;
                    
                    // Save settled bet to bet history table
                    await ctx.db.insert("betHistory", {
                        userId: user._id,
                        clerkId: user.clerkId,
                        accountId: account.id,
                        accountEmail: account.email,
                        team1: bet.team1,
                        team2: bet.team2,
                        dividedBy: bet.dividedBy,
                        betAmount: bet.betAmount,
                        timestamp: Date.now(),
                        winningTeam: args.winningTeam,
                        payout: winAmount,
                        profit: winAmount - bet.betAmount,
                        balanceBeforeBet,
                        balanceAfterBet
                    });
                } else {
                    // Even if user lost, save the bet to history
                    await ctx.db.insert("betHistory", {
                        userId: user._id,
                        clerkId: user.clerkId,
                        accountId: account.id,
                        accountEmail: account.email,
                        team1: bet.team1,
                        team2: bet.team2,
                        dividedBy: bet.dividedBy,
                        betAmount: bet.betAmount,
                        timestamp: Date.now(),
                        winningTeam: args.winningTeam,
                        payout: 0,
                        profit: -bet.betAmount,
                        balanceBeforeBet: updatedAccounts[i].totalBalance,
                        balanceAfterBet: updatedAccounts[i].totalBalance
                    });
                }
            }
            
            // Remove settled bets from the account
            updatedAccounts[i].bets = account.bets.filter((bet: any) => 
                !(bet.team1.name === team1Name && bet.team2.name === team2Name) &&
                !(bet.team1.name === team2Name && bet.team2.name === team1Name)
            );
        }
        
        // Calculate total balance sum after settling bets
        const totalBalanceSumAfterSettlingBets = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        // Calculate profit or loss (difference between after settling and before placing)
        const profitOrLoss = totalBalanceSumAfterSettlingBets - (user.totalBalanceSumBeforePlacingBet || 0);
        
        // Calculate net profit or loss by adding current profit/loss to previous net profit/loss
        const netProfitOrLoss = (user.netProfitOrLoss || 0) + profitOrLoss;
        
        // Update user with new account balances, filtered bets, and profit/loss data
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSum: totalBalanceSumAfterSettlingBets,
            totalBalanceSumAfterSettlingBets,
            profitOrLoss,
            netProfitOrLoss
        });
        
        return {
            settledBetsCount,
            profitOrLoss
        };
    }
});

export const updateAccountBalance = mutation({
    args: {
        clerkId: v.string(),
        accountId: v.string(),
        amount: v.number(),
        type: v.union(v.literal("deposit"), v.literal("withdrawal")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const accountIndex = user.accounts.findIndex((account: any) => account.id === args.accountId);
        
        if (accountIndex === -1) {
            throw new Error("Account not found");
        }
        
        // Create updated account
        const updatedAccount = {
            ...user.accounts[accountIndex],
            totalBalance: args.type === "deposit" 
                ? user.accounts[accountIndex].totalBalance + args.amount
                : user.accounts[accountIndex].totalBalance - args.amount,
        };
        
        // Validate withdrawal
        if (args.type === "withdrawal" && updatedAccount.totalBalance < 0) {
            throw new Error("Insufficient balance for withdrawal");
        }
        
        // Create new accounts array with the updated account
        const updatedAccounts = [...user.accounts];
        updatedAccounts[accountIndex] = updatedAccount;
        
        // Calculate new total balance sum
        const totalBalanceSum = updatedAccounts.reduce(
            (sum, account) => sum + account.totalBalance, 
            0
        );
        
        // Update user with new accounts array and total balance sum
        await ctx.db.patch(user._id, {
            accounts: updatedAccounts,
            totalBalanceSum
        });
        
        return updatedAccount;
    }
});

export const getUser = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            return null;
        }
        
        return user;
    }
});

export const resetProfitLoss = mutation({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        // Reset profit/loss and balance sums to zero
        await ctx.db.patch(user._id, {
            profitOrLoss: 0,
            netProfitOrLoss: 0,
            totalBalanceSumBeforePlacingBet: 0,
            totalBalanceSumAfterSettlingBets: 0
        });
        
        return true;
    }
});

// New query to get bet history for a user
export const getBetHistory = query({
    args: {
        clerkId: v.string(),
        limit: v.optional(v.number()),
        cursor: v.optional(v.id("betHistory")),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        
        // Get the user's bet history, newest first
        const betHistory = await ctx.db
            .query("betHistory")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .order("desc")
            .take(limit);
        
        return betHistory;
    }
});

// Add a new mutation to clear bet history
export const clearBetHistory = mutation({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        // Find all bet history records for this user
        const betHistoryRecords = await ctx.db
            .query("betHistory")
            .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
            .collect();
        
        // Delete each record
        for (const record of betHistoryRecords) {
            await ctx.db.delete(record._id);
        }
        
        return { 
            success: true,
            deletedCount: betHistoryRecords.length
        };
    }
});