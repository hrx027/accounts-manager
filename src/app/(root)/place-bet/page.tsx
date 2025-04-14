"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MoneyValue } from "@/components/ui/money-value";

type Account = {
  id: string;
  email: string;
  pno?: string;
  adhaarid?: string;
  username?: string;
  deviceLocation?: string;
  totalBalance: number;
  bets: any[];
};

type TeamData = {
  name: string;
  odds: number;
};

function PlaceBetPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const accounts = useQuery(api.users.getUserAccounts, { clerkId }) || [];
  const placeBet = useMutation(api.users.placeBet);
  
  const [team1, setTeam1] = useState<TeamData>({ name: "", odds: 0 });
  const [team2, setTeam2] = useState<TeamData>({ name: "", odds: 0 });
  const [dividedBy, setDividedBy] = useState<number>(0);
  const [showTeamsForm, setShowTeamsForm] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({});
  
  const handleTeam1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeam1(prev => ({
      ...prev,
      [name]: name === "odds" ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleTeam2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeam2(prev => ({
      ...prev,
      [name]: name === "odds" ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleDividedByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDividedBy(parseFloat(e.target.value) || 0);
  };
  
  const handleContinue = () => {
    // Validate form
    if (!team1.name || !team2.name || team1.odds <= 0 || team2.odds <= 0 || dividedBy <= 0) {
      toast.error("Please fill in all fields with valid values");
      return;
    }
    
    setShowTeamsForm(false);
  };
  
  const handleBack = () => {
    setShowTeamsForm(true);
    setSelectedAccounts({});
  };
  
  const handleTeamSelection = (accountId: string, team: "team1" | "team2") => {
    setSelectedAccounts(prev => {
      // If this account already has this team selected, unselect it
      if (prev[accountId] === team) {
        const newSelections = { ...prev };
        delete newSelections[accountId];
        return newSelections;
      }
      
      // Otherwise select this team for this account
      return {
        ...prev,
        [accountId]: team
      };
    });
  };
  
  const handlePlaceBet = async () => {
    if (Object.keys(selectedAccounts).length === 0) {
      toast.error("Please select at least one account for betting");
      return;
    }
    
    if (!clerkId) return;
    
    // Prepare data for the mutation
    const accountIds: string[] = [];
    const teamSelections: string[] = [];
    
    Object.entries(selectedAccounts).forEach(([accountId, team]) => {
      accountIds.push(accountId);
      teamSelections.push(team);
    });
    
    try {
      toast.promise(
        placeBet({
          clerkId,
          accountIds,
          teamSelections,
          team1,
          team2,
          dividedBy
        }),
        {
          loading: 'Placing bet...',
          success: () => {
            // Reset form
            setTeam1({ name: "", odds: 0 });
            setTeam2({ name: "", odds: 0 });
            setDividedBy(0);
            setShowTeamsForm(true);
            setSelectedAccounts({});
            return 'Bet placed successfully!';
          },
          error: (error) => {
            console.error("Failed to place bet:", error);
            return `Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to place bet:", error);
      toast.error(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 bg-white dark:bg-[#0F212E] text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Place Bet</h1>
      
      {showTeamsForm ? (
        <Card className="mb-6 bg-white dark:bg-[#1A2C3A] border border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 border p-4 rounded-lg border-gray-300 dark:border-gray-500 bg-white dark:bg-[#1A2C3A]">
                <h3 className="text-lg font-medium text-black dark:text-white">Team 1</h3>
                <div className="space-y-2">
                  <Label htmlFor="team1-name" className="text-gray-700 dark:text-gray-200">Team Name</Label>
                  <Input 
                    id="team1-name" 
                    name="name" 
                    value={team1.name}
                    onChange={handleTeam1Change}
                    placeholder="Enter team name"
                    required
                    className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team1-odds" className="text-gray-700 dark:text-gray-200">Odds</Label>
                  <Input 
                    id="team1-odds" 
                    name="odds" 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={team1.odds || ""}
                    onChange={handleTeam1Change}
                    placeholder="Enter odds"
                    required
                    className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-4 border p-4 rounded-lg border-gray-300 dark:border-gray-500 bg-white dark:bg-[#1A2C3A]">
                <h3 className="text-lg font-medium text-black dark:text-white">Team 2</h3>
                <div className="space-y-2">
                  <Label htmlFor="team2-name" className="text-gray-700 dark:text-gray-200">Team Name</Label>
                  <Input 
                    id="team2-name" 
                    name="name" 
                    value={team2.name}
                    onChange={handleTeam2Change}
                    placeholder="Enter team name"
                    required
                    className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team2-odds" className="text-gray-700 dark:text-gray-200">Odds</Label>
                  <Input 
                    id="team2-odds" 
                    name="odds" 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={team2.odds || ""}
                    onChange={handleTeam2Change}
                    placeholder="Enter odds"
                    required
                    className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dividedBy" className="text-gray-700 dark:text-gray-200">Divided By (₹)</Label>
                <Input 
                  id="dividedBy" 
                  type="number"
                  min="1"
                  step="1"
                  value={dividedBy || ""}
                  onChange={handleDividedByChange}
                  placeholder="Enter total amount to be divided"
                  required
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  For Team 1: <MoneyValue value={dividedBy / team1.odds} className="text-xs" /> will be deducted per account
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  For Team 2: <MoneyValue value={dividedBy / team2.odds} className="text-xs" /> will be deducted per account
                </p>
              </div>
            </div>
            
            <Button className="mt-6 w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 text-white cursor-pointer" onClick={handleContinue}>
              Continue to Account Selection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6 bg-white dark:bg-[#1A2C3A] border border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Team 1</p>
                  <p className="font-medium text-black dark:text-white">{team1.name} ({team1.odds})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Team 2</p>
                  <p className="font-medium text-black dark:text-white">{team2.name} ({team2.odds})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Bet Details</p>
                  <p className="font-medium text-black dark:text-white">Amount: <MoneyValue value={dividedBy} /></p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    Team 1 accounts: <MoneyValue value={dividedBy / team1.odds} className="text-xs" /> each
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Team 2 accounts: <MoneyValue value={dividedBy / team2.odds} className="text-xs" /> each
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 border-gray-300 dark:border-gray-600 bg-white hover:bg-gray-100 dark:bg-[#223541] dark:hover:bg-[#2A3F50] text-gray-700 dark:text-gray-200" onClick={handleBack}>
                Back to Edit
              </Button>
            </CardContent>
          </Card>
          
          {accounts.length === 0 ? (
            <Card className="bg-white dark:bg-[#1A2C3A] border border-gray-200 dark:border-gray-600">
              <CardContent className="py-6">
                <p className="text-center text-gray-500 dark:text-gray-300">
                  No accounts available. Please add accounts before placing a bet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-4 bg-white dark:bg-[#1A2C3A] border border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Select Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 px-4 py-3 bg-gray-50 dark:bg-[#223541] rounded-lg">
                    <h3 className="text-sm font-medium mb-2 text-black dark:text-white">Bet Summary</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>Match: {team1.name} vs {team2.name}</p>
                      <p>Total pot: <MoneyValue value={dividedBy} /></p>
                      <p>Team 1 accounts: <MoneyValue value={dividedBy / team1.odds} /> each</p>
                      <p>Team 2 accounts: <MoneyValue value={dividedBy / team2.odds} /> each</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-white dark:bg-[#1A2C3A]">
                        <TableRow className="border-b border-gray-200 dark:border-gray-600">
                          <TableHead className="text-gray-700 dark:text-gray-200">Email</TableHead>
                          <TableHead className="text-right text-gray-700 dark:text-gray-200">Balance</TableHead>
                          <TableHead className="text-center text-gray-700 dark:text-gray-200">{team1.name}</TableHead>
                          <TableHead className="text-center text-gray-700 dark:text-gray-200">{team2.name}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account: Account) => (
                          <TableRow key={account.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#223541]">
                            <TableCell className="text-black dark:text-white">{account.email}</TableCell>
                            <TableCell className="text-right text-black dark:text-white">
                              <MoneyValue value={account.totalBalance} />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={selectedAccounts[account.id] === "team1"}
                                  onCheckedChange={() => handleTeamSelection(account.id, "team1")}
                                  disabled={selectedAccounts[account.id] === "team2" || account.totalBalance < dividedBy / team1.odds}
                                  className="text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={selectedAccounts[account.id] === "team2"}
                                  onCheckedChange={() => handleTeamSelection(account.id, "team2")}
                                  disabled={selectedAccounts[account.id] === "team1" || account.totalBalance < dividedBy / team2.odds}
                                  className="text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={handleBack} className="px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]">
                  Back
                </Button>
                <Button onClick={handlePlaceBet} className="px-6 bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 text-white cursor-pointer">
                  Place Bet
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceBetPage;