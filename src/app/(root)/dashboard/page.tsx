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
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
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
    <div className="p-4 sm:p-6 space-y-6 bg-white dark:bg-[#0F212E] md:pt-6 pt-16">
      {/* Header with UserButton */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Financial cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Total balance card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1A2C3A]">
          <CardHeader className="pb-2">
            <CardTitle className="text-black dark:text-white">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black dark:text-white tracking-tight">
              <MoneyValue value={totalBalance} className="text-3xl font-bold" />
            </div>
          </CardContent>
        </Card>

        {/* Profit/Loss card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1A2C3A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-black dark:text-white">{isProfitable ? 'Net Profit' : 'Net Loss'}</CardTitle>
            <Button
              onClick={handleResetProfitLoss}
              variant="outline"
              size="sm"
              className="h-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]"
            >
              Reset
            </Button>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              <MoneyValue value={netProfitOrLoss} showSign={true} className="text-3xl font-bold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts table or No Accounts Message */}
      <Card className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1A2C3A]">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-white dark:bg-[#1A2C3A]">
                  <TableRow className="border-b border-gray-200 dark:border-gray-600">
                    <TableHead className="text-gray-700 dark:text-gray-200 pl-4">Email</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">Balance</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200 pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account: Account) => (
                    <TableRow key={account.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#223541]">
                      <TableCell className="max-w-[150px] truncate text-black dark:text-white pl-4">{account.email}</TableCell>
                      <TableCell className="text-right text-black dark:text-white font-semibold">
                        <MoneyValue value={account.totalBalance} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1 sm:gap-2 flex-wrap">
                          {activeAccount === account.id && activeAction ? (
                            <>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={actionAmount || ""}
                                onChange={(e) => setActionAmount(parseFloat(e.target.value) || 0)}
                                placeholder="Amount"
                                className="w-20 sm:w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#223541] text-black dark:text-white font-semibold"
                              />
                              <Button 
                                size="sm"
                                variant={activeAction === "deposit" ? "default" : "outline"}
                                onClick={handleActionSubmit}
                                className={activeAction === "deposit" ? 
                                  "bg-gray-800 hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600 text-white" : 
                                  "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]"}
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
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#223541]"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleActionClick(account.id, "deposit")}
                                className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600 text-white"
                              >
                                Deposit
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleActionClick(account.id, "withdrawal")}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#223541]"
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-gray-500 dark:text-gray-300 mb-4">
                You don't have any accounts yet. Add an account to get started.
              </p>
              <Link href="/account-details">
                <Button className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600 text-white cursor-pointer">Go to Accounts</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;