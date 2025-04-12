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
import { ChevronDown, ChevronUp, Trophy, Users, Award } from "lucide-react";
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
  pno: string;
  adhaarid: string;
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Current Matches</h1>
      
      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No active matches found</p>
              <Button variant="outline" onClick={() => window.location.href = "/place-bet"}>
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
              <Card key={matchId} className="overflow-hidden">
                <div className="flex items-center justify-between p-4 py-3">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-muted/20"
                    onClick={() => toggleMatch(matchId)}
                  >
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      {match.team1} vs {match.team2}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {match.bets.length} {match.bets.length === 1 ? 'bet' : 'bets'} placed
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleSettleBet(matchId, match.team1, match.team2)}
                    >
                      <Award className="h-4 w-4" /> Settle Bet
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMatch(matchId)}>
                      {expandedMatch === matchId ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </div>
                
                {expandedMatch === matchId && (
                  <div className="bg-muted/10 border-t pt-2">
                    <div className="p-4 grid gap-4">
                      {match.bets.map((item, betIndex) => {
                        const selectedTeam = getSelectedTeam(item.bet);
                        
                        return (
                          <Card key={betIndex} className="relative">
                            <div className="absolute top-3 right-3">
                              <Badge variant="outline">{formatDate(item.bet.timestamp)}</Badge>
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                Account: {item.account.email}
                              </CardTitle>
                              <CardDescription>
                                Balance: ₹{item.account.totalBalance.toFixed(2)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className={`p-3 rounded-lg border ${selectedTeam === item.bet.team1 ? 'bg-primary/10 border-primary' : 'border-muted'}`}>
                                    <p className="font-medium">{item.bet.team1.name}</p>
                                    <p className="text-sm text-muted-foreground">Odds: {item.bet.team1.odds}</p>
                                    {selectedTeam === item.bet.team1 && (
                                      <Badge className="mt-2">Selected</Badge>
                                    )}
                                  </div>
                                  <div className={`p-3 rounded-lg border ${selectedTeam === item.bet.team2 ? 'bg-primary/10 border-primary' : 'border-muted'}`}>
                                    <p className="font-medium">{item.bet.team2.name}</p>
                                    <p className="text-sm text-muted-foreground">Odds: {item.bet.team2.odds}</p>
                                    {selectedTeam === item.bet.team2 && (
                                      <Badge className="mt-2">Selected</Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-2 pt-4 border-t">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Bet Amount</p>
                                      <p className="font-medium">₹{item.bet.betAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Total Pot</p>
                                      <p className="font-medium">₹{item.bet.dividedBy.toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Bet</DialogTitle>
            <DialogDescription>
              Select the match result and additional options to settle this bet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Which team won?</h4>
              <RadioGroup 
                value={winningTeam} 
                onValueChange={setWinningTeam}
                className="grid grid-cols-1 gap-2"
              >
                {selectedMatchId && (
                  <>
                    {selectedMatchId.split("-vs-").map((team, i) => (
                      <div key={i} className="flex items-center space-x-2 border p-2 rounded-md">
                        <RadioGroupItem value={team} id={`team-${i}`} />
                        <Label htmlFor={`team-${i}`}>{team}</Label>
                      </div>
                    ))}
                  </>
                )}
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Additional Options</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 border p-2 rounded-md">
                  <Checkbox id="losing-six" checked={losingTeamHitSix} onCheckedChange={checked => setLosingTeamHitSix(checked === true)} />
                  <Label htmlFor="losing-six">Losing team hit six</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Cashout Options</h4>
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
                      <div key={index} className="border p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{item.account.email}</p>
                            <p className="text-sm text-muted-foreground">Bet Amount: ₹{item.bet.betAmount.toFixed(2)}</p>
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
                            <Label htmlFor={`amount-${index}`} className="mb-2 block">Cashout Amount (₹)</Label>
                            <div className="flex gap-2">
                              <Input 
                                id={`amount-${index}`}
                                type="number"
                                min="1"
                                step="1"
                                value={cashoutAmount || ""}
                                onChange={(e) => handleCashoutAmountChange(item.account.id, parseFloat(e.target.value) || 0)}
                                placeholder="Enter amount"
                                className="w-full"
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
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSettleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitSettleBet}>Settle Bet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CurrentBetPage;