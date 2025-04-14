"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Define bet history item interface
interface BetHistoryItem {
  _id: string;
  userId: string;
  clerkId: string;
  accountId: string;
  accountEmail: string;
  team1: {
    name: string;
    odds: number;
  };
  team2: {
    name: string;
    odds: number;
  };
  dividedBy: number;
  betAmount: number;
  timestamp: number;
  winningTeam: string;
  payout: number;
  profit: number;
  balanceBeforeBet: number;
  balanceAfterBet: number;
}

function BetHistoryPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Fetch bet history for the logged-in user
  const betHistory = useQuery(api.users.getBetHistory, { 
    clerkId,
    limit: 50
  }) as BetHistoryItem[] | undefined;

  // Mutation to clear bet history
  const clearBetHistory = useMutation(api.users.clearBetHistory);

  // Handle clearing bet history
  const handleClearHistory = async () => {
    if (!clerkId) return;
    
    try {
      toast.promise(
        clearBetHistory({ clerkId }),
        {
          loading: 'Clearing bet history...',
          success: (result) => {
            setIsResetDialogOpen(false);
            return `Successfully cleared ${result.deletedCount} betting records`;
          },
          error: (error) => {
            console.error("Failed to clear bet history:", error);
            return `Failed to clear history: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to clear bet history:", error);
      toast.error(`Failed to clear history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 bg-white dark:bg-[#0F212E] text-black dark:text-white">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Bet History</h1>

        {betHistory && betHistory.length > 0 && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-gray-300 dark:border-gray-600"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>
      
      {!betHistory || betHistory.length === 0 ? (
        <Card className="bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">No Betting History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-300">Place and settle some bets to see your betting history here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden overflow-x-auto bg-white dark:bg-[#1A2C3A]">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-[#223541]">
              <TableRow className="border-b border-gray-200 dark:border-gray-600">
                <TableHead className="text-gray-700 dark:text-gray-200">Match</TableHead>
                <TableHead className="hidden md:table-cell text-gray-700 dark:text-gray-200">Account</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200">Bet Amount</TableHead>
                <TableHead className="hidden sm:table-cell text-gray-700 dark:text-gray-200">Odds</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200">Result</TableHead>
                <TableHead className="hidden sm:table-cell text-gray-700 dark:text-gray-200">Payout</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">Profit/Loss</TableHead>
                <TableHead className="hidden md:table-cell text-gray-700 dark:text-gray-200">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {betHistory.map((bet: BetHistoryItem) => {
                // Determine which team was selected by looking at odds
                const selectedTeam = 
                  bet.team1.odds > 0 ? bet.team1 : 
                  bet.team2.odds > 0 ? bet.team2 : null;
                
                const isWin = bet.profit > 0;
                
                return (
                  <TableRow key={bet._id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#223541]">
                    <TableCell className="font-medium max-w-[150px] truncate text-black dark:text-white">
                      <div className="flex flex-col">
                        <span>{bet.team1.name} vs {bet.team2.name}</span>
                        <span className="block md:hidden text-xs text-gray-500 dark:text-gray-300 mt-1 truncate">
                          {bet.accountEmail}
                        </span>
                        <span className="block sm:hidden text-xs text-gray-500 dark:text-gray-300 mt-1">
                          {selectedTeam ? `${selectedTeam.name}: ${selectedTeam.odds}` : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-black dark:text-white">{bet.accountEmail}</TableCell>
                    <TableCell className="text-black dark:text-white font-mono font-medium">₹{bet.betAmount.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell text-black dark:text-white">
                      {selectedTeam ? (
                        <div>
                          {selectedTeam.name}: {selectedTeam.odds}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {selectedTeam?.name === bet.winningTeam ? (
                        <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white">WON</Badge>
                      ) : (
                        <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white">LOST</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-black dark:text-white font-mono font-medium">₹{bet.payout.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={`${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} px-2 py-1 rounded ${isWin ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} font-mono font-semibold`}>
                        {isWin ? '+' : ''}₹{bet.profit.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-300 hidden md:table-cell">
                      {new Date(bet.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation dialog for clearing history */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600 text-black dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">Clear Betting History?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-300">
              This action cannot be undone. This will permanently delete all your bet history records.
              Your account balances and current bets will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A3F50]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearHistory}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BetHistoryPage;