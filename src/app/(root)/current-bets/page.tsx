"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trophy, Users, Award, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { MoneyValue } from "@/components/ui/money-value";

type Bet = {
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
};

type Account = {
  id: string;
  email: string;
  pno?: string;
  adhaarid?: string;
  username?: string;
  deviceLocation?: string;
  totalBalance: number;
  bets: Bet[];
};

// Match type to organize bets by matches
type Match = {
  team1: string;
  team2: string;
  bets: {
    bet: Bet;
    account: Account;
  }[];
};

function CurrentBetPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const accounts = useQuery(api.users.getUserAccounts, { clerkId }) || [];
  const settleBet = useMutation(api.users.settleBet);
  
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [winningTeam, setWinningTeam] = useState<string>("");
  const [losingTeamHitSix, setLosingTeamHitSix] = useState(false);
  const [cashoutAccounts, setCashoutAccounts] = useState<{accountId: string, amount: number}[]>([]);
  
  // Get the selected team in a bet
  const getSelectedTeam = (bet: Bet) => {
    if (bet.team1.odds > 0 && bet.team2.odds === 0) return bet.team1;
    if (bet.team2.odds > 0 && bet.team1.odds === 0) return bet.team2;
    return null; // If neither or both teams have non-zero odds (shouldn't happen)
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Toggle match expansion
  const toggleMatch = (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
    }
  };
  
  // Handle opening the settle bet dialog
  const handleSettleBet = (matchId: string, team1: string, team2: string) => {
    setSelectedMatchId(matchId);
    setWinningTeam(team1); // Default to team1
    setLosingTeamHitSix(false);
    setCashoutAccounts([]);
    setIsSettleDialogOpen(true);
  };
  
  // Handle cashout amount change for an account
  const handleCashoutAmountChange = (accountId: string, amount: number) => {
    setCashoutAccounts(prev => {
      const existingIndex = prev.findIndex(acc => acc.accountId === accountId);
      if (existingIndex >= 0) {
        const newAccounts = [...prev];
        newAccounts[existingIndex] = { accountId, amount };
        return newAccounts;
      } else {
        return [...prev, { accountId, amount }];
      }
    });
  };
  
  // Handle removing cashout for an account
  const handleRemoveCashout = (accountId: string) => {
    setCashoutAccounts(prev => prev.filter(acc => acc.accountId !== accountId));
  };
  
  // Handle submitting the settle bet form
  const handleSubmitSettleBet = async () => {
    if (!selectedMatchId || !winningTeam || !clerkId) {
      toast.error("Please select a winning team");
      return;
    }
    
    // Validate cashout amounts
    const invalidCashout = cashoutAccounts.some(acc => acc.amount <= 0);
    if (invalidCashout) {
      toast.error("Please enter valid cashout amounts for all selected accounts");
      return;
    }
    
    try {
      // Start settling bets

      toast.promise(
        settleBet({
          clerkId,
          matchId: selectedMatchId,
          winningTeam,
          losingTeamHitSix,
          cashoutAccounts: cashoutAccounts.length > 0 ? cashoutAccounts : undefined
        }),
        {
          loading: 'Settling bets...',
          success: (result) => {
            setIsSettleDialogOpen(false);
            return `Successfully settled ${result.settledBetsCount} bets!`;
          },
          error: (error) => {
            console.error("Failed to settle bet:", error);
            return `Failed to settle bets: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to settle bet:", error);
      toast.error(`Failed to settle bets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Organize bets by matches
  const matches = useMemo(() => {
    const matchesMap = new Map<string, Match>();
    
    accounts.forEach(account => {
      if (!account.bets || account.bets.length === 0) return;
      
      account.bets.forEach(bet => {
        const matchId = `${bet.team1.name}-vs-${bet.team2.name}`;
        
        if (!matchesMap.has(matchId)) {
          matchesMap.set(matchId, {
            team1: bet.team1.name,
            team2: bet.team2.name,
            bets: []
          });
        }
        
        matchesMap.get(matchId)?.bets.push({
          bet,
          account
        });
      });
    });
    
    // Convert map to array and sort by most recent bet
    return Array.from(matchesMap.values())
      .sort((a, b) => {
        const latestBetA = Math.max(...a.bets.map(item => item.bet.timestamp));
        const latestBetB = Math.max(...b.bets.map(item => item.bet.timestamp));
        return latestBetB - latestBetA;
      });
  }, [accounts]);
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 bg-white dark:bg-[#0F212E] text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Current Matches</h1>
      
      {matches.length === 0 ? (
        <Card className="bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600">
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-300 mb-4">No active matches found</p>
              <Button variant="outline" onClick={() => window.location.href = "/place-bet"} 
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]">
                Place Your First Bet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match, index) => {
            const matchId = `${match.team1}-vs-${match.team2}`;
            
            return (
              <Card key={matchId} className="overflow-hidden bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between p-4 py-3 flex-wrap gap-2">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#223541] min-w-[200px]"
                    onClick={() => toggleMatch(matchId)}
                  >
                    <h3 className="text-lg font-medium flex items-center gap-2 text-black dark:text-white">
                      <Trophy className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      {match.team1} vs {match.team2}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {match.bets.length} {match.bets.length === 1 ? 'bet' : 'bets'} placed
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]"
                      onClick={() => handleSettleBet(matchId, match.team1, match.team2)}
                    >
                      <Award className="h-4 w-4" /> <span className="hidden sm:inline">Settle Bet</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMatch(matchId)}
                      className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]">
                      {expandedMatch === matchId ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </div>
                
                {expandedMatch === matchId && (
                  <div className="p-4 pt-0 bg-gray-50 dark:bg-[#223541] space-y-3">
                    {match.bets.map((item, betIndex) => {
                      const selectedTeam = getSelectedTeam(item.bet);
                      
                      return (
                        <Card key={`${matchId}-bet-${betIndex}`} className="bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600">
                          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <div className="mb-2">
                                <Badge variant="outline" className="mb-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                  {formatDate(item.bet.timestamp)}
                                </Badge>
                                <h4 className="text-md font-medium text-black dark:text-white">
                                  {item.account.email}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Balance: <MoneyValue value={item.account.totalBalance} />
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600 dark:text-gray-300">Team Selected</p>
                                  <p className="font-medium text-black dark:text-white">{selectedTeam?.name || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-300">Odds</p>
                                  <p className="font-medium text-black dark:text-white">{selectedTeam?.odds.toFixed(2) || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-300">Bet Amount</p>
                                  <p className="font-medium text-black dark:text-white">
                                    <MoneyValue value={item.bet.betAmount} />
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-300">Divided By</p>
                                  <p className="font-medium text-black dark:text-white">
                                    <MoneyValue value={item.bet.dividedBy} />
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col max-w-[calc(100%-2rem)] bg-white dark:bg-[#1A2C3A] text-black dark:text-white border-gray-200 dark:border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Settle Bet</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-300">
              Select the match result and additional options to settle this bet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6 overflow-y-auto pr-2">
            <div className="space-y-4">
              <h4 className="font-medium text-black dark:text-white">Which team won?</h4>
              <RadioGroup 
                value={winningTeam} 
                onValueChange={setWinningTeam}
                className="grid grid-cols-1 gap-2"
              >
                {selectedMatchId && (
                  <>
                    {selectedMatchId.split("-vs-").map((team, i) => (
                      <div key={i} className="flex items-center space-x-2 border border-gray-200 dark:border-gray-600 p-2 rounded-md">
                        <RadioGroupItem value={team} id={`team-${i}`} />
                        <Label htmlFor={`team-${i}`} className="text-black dark:text-white">{team}</Label>
                      </div>
                    ))}
                  </>
                )}
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-black dark:text-white">Additional Options</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-600 p-2 rounded-md">
                  <Checkbox id="losing-six" checked={losingTeamHitSix} onCheckedChange={checked => setLosingTeamHitSix(checked === true)} />
                  <Label htmlFor="losing-six" className="text-black dark:text-white">Losing team hit six</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-black dark:text-white">Cashout Options</h4>
              <div className="space-y-4">
                {selectedMatchId && matches.find(m => `${m.team1}-vs-${m.team2}` === selectedMatchId)?.bets
                  .filter(item => {
                    const selectedTeam = getSelectedTeam(item.bet);
                    return selectedTeam && selectedTeam.name !== winningTeam;
                  })
                  .map((item, index) => {
                    const isCashedOut = cashoutAccounts.some(acc => acc.accountId === item.account.id);
                    const cashoutAmount = cashoutAccounts.find(acc => acc.accountId === item.account.id)?.amount || 0;
                    
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px] text-black dark:text-white">{item.account.email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Bet Amount: <MoneyValue value={item.bet.betAmount} /></p>
                          </div>
                          <Checkbox 
                            id={`cashout-${index}`}
                            checked={isCashedOut}
                            onCheckedChange={checked => {
                              if (checked === true) {
                                handleCashoutAmountChange(item.account.id, 0);
                              } else {
                                handleRemoveCashout(item.account.id);
                              }
                            }}
                          />
                        </div>
                        {isCashedOut && (
                          <div className="mt-2">
                            <Label htmlFor={`amount-${index}`} className="mb-2 block text-black dark:text-white">Cashout Amount (₹)</Label>
                            <div className="flex gap-2">
                              <Input 
                                id={`amount-${index}`}
                                type="number" 
                                min="1"
                                step="1"
                                value={cashoutAmount || ""}
                                onChange={(e) => handleCashoutAmountChange(item.account.id, parseFloat(e.target.value) || 0)}
                                placeholder="Enter amount"
                                className="w-full bg-white dark:bg-[#223541] border-gray-200 dark:border-gray-600 text-black dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-2 border-t border-gray-200 dark:border-gray-600 mt-2 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsSettleDialogOpen(false)} 
              className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]">
              Cancel
            </Button>
            <Button onClick={handleSubmitSettleBet} 
              className="bg-gray-800 hover:bg-gray-900 text-white">
              Settle Bet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CurrentBetPage;