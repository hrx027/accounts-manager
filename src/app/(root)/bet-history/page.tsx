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
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bet History</h1>

        {betHistory && betHistory.length > 0 && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>
      
      {!betHistory || betHistory.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Betting History</CardTitle>
            <CardContent>
              <p className="text-gray-500">Place and settle some bets to see your betting history here.</p>
            </CardContent>
          </CardHeader>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Bet Amount</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                <TableHead>Time</TableHead>
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
                  <TableRow key={bet._id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {bet.team1.name} vs {bet.team2.name}
                    </TableCell>
                    <TableCell>{bet.accountEmail}</TableCell>
                    <TableCell>₹{bet.betAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      {selectedTeam ? (
                        <div>
                          {selectedTeam.name}: {selectedTeam.odds}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {selectedTeam?.name === bet.winningTeam ? (
                        <Badge className="bg-green-400 hover:bg-green-500 text-black">WON</Badge>
                      ) : (
                        <Badge className="bg-red-400 hover:bg-rose-300 text-black">LOST</Badge>
                      )}
                    </TableCell>
                    <TableCell>₹{bet.payout.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={`${isWin ? 'text-green-500' : 'text-red-500'} px-2 py-1 rounded ${isWin ? 'bg-green-50' : 'bg-red-50'}`}>
                        {isWin ? '+' : ''}₹{bet.profit.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Betting History?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your bet history records.
              Your account balances and current bets will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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