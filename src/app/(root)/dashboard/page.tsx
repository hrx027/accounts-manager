"use client";

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
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

type Account = {
  id: string;
  email: string;
  pno: string;
  adhaarid: string;
  totalBalance: number;
  bets: any[];
};

type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  clerkId: string;
  totalBalanceSum?: number;
  totalBalanceSumBeforePlacingBet?: number;
  totalBalanceSumAfterSettlingBets?: number;
  profitOrLoss?: number;
  netProfitOrLoss?: number;
  accounts: Account[];
};

type ActionType = "deposit" | "withdrawal" | null;

function DashboardPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const userData = useQuery(api.users.getUser, { clerkId }) as User | undefined;
  const accounts = userData?.accounts || [];
  const updateBalance = useMutation(api.users.updateAccountBalance);
  const resetProfit = useMutation(api.users.resetProfitLoss);
  
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionAmount, setActionAmount] = useState<number>(0);

  // Get netProfitOrLoss from user data instead of profitOrLoss
  const netProfitOrLoss = userData?.netProfitOrLoss || 0;
  const isProfitable = netProfitOrLoss >= 0;

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum: number, account: Account) => sum + account.totalBalance, 0);

  const handleActionClick = (accountId: string, action: ActionType) => {
    if (activeAccount === accountId && activeAction === action) {
      // Toggle off if clicking the same action
      setActiveAccount(null);
      setActiveAction(null);
    } else {
      setActiveAccount(accountId);
      setActiveAction(action);
      setActionAmount(0);
    }
  };

  const handleActionSubmit = async () => {
    if (!activeAccount || !activeAction) return;
    
    if (!actionAmount || actionAmount <= 0) {
      toast.error(`Please enter a valid ${activeAction} amount`);
      return;
    }

    try {
      await updateBalance({
        clerkId,
        accountId: activeAccount,
        amount: actionAmount,
        type: activeAction
      });
      setActionAmount(0);
      setActiveAccount(null);
      setActiveAction(null);
      toast.success(`${activeAction === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
    } catch (error) {
      toast.error(`Failed to process ${activeAction}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResetProfitLoss = async () => {
    try {
      await resetProfit({ clerkId });
      toast.success("Profit/Loss reset to zero successfully!");
    } catch (error) {
      toast.error(`Failed to reset Profit/Loss: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with UserButton */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Financial cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total balance card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        {/* Profit/Loss card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{isProfitable ? 'Net Profit' : 'Net Loss'}</CardTitle>
            <Button
              onClick={handleResetProfitLoss}
              variant="outline"
              size="sm"
              className="h-8"
            >
              Reset
            </Button>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              ₹{Math.abs(netProfitOrLoss).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: Account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.email}</TableCell>
                  <TableCell className="text-right">₹{account.totalBalance.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {activeAccount === account.id && activeAction ? (
                        <>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={actionAmount || ""}
                            onChange={(e) => setActionAmount(parseFloat(e.target.value) || 0)}
                            placeholder="Amount"
                            className="w-32"
                          />
                          <Button 
                            size="sm"
                            variant={activeAction === "deposit" ? "default" : "outline"}
                            onClick={handleActionSubmit}
                          >
                            {activeAction === "deposit" ? "Deposit" : "Withdraw"}
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveAccount(null);
                              setActiveAction(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleActionClick(account.id, "deposit")}
                          >
                            Deposit
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionClick(account.id, "withdrawal")}
                          >
                            Withdraw
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;