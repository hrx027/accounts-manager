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
import { Label } from "@/components/ui/label";
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

type ActionType = "deposit" | "withdraw" | null;

function DashboardPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const accounts = useQuery(api.users.getUserAccounts, { clerkId }) || [];
  const updateBalance = useMutation(api.users.updateAccountBalance);
  
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.totalBalance, 0);

  const handleAction = async (accountId: string) => {
    const amount = amounts[accountId];
    if (!amount || amount <= 0) {
      toast.error(`Please enter a valid ${activeAction} amount`);
      return;
    }

    try {
      await updateBalance({
        clerkId,
        accountId,
        amount,
        type: activeAction === "deposit" ? "deposit" : "withdrawal"
      });
      setAmounts(prev => ({ ...prev, [accountId]: 0 }));
      setActiveAction(null);
      setSelectedAccount(null);
      toast.success(`${activeAction === "deposit" ? "Deposit" : "Withdrawal"} successful!`);
    } catch (error) {
      toast.error(`Failed to ${activeAction}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleActionButtonClick = (action: ActionType) => {
    setActiveAction(prev => prev === action ? null : action);
    setSelectedAccount(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left div with total balance */}
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">₹{totalBalance.toFixed(2)}</div>
              <div className="text-muted-foreground">|</div>
              <div className="text-green-500">Profit: ₹0.00</div>
            </div>
          </CardContent>
        </Card>

        {/* Right div with user info */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
            <div>
              <div className="font-semibold">{user?.fullName}</div>
              <div className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Accounts</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={activeAction === "deposit" ? "default" : "outline"}
              onClick={() => handleActionButtonClick("deposit")}
              className={activeAction === "deposit" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {activeAction === "deposit" ? "Cancel Deposit" : "Deposit"}
            </Button>
            <Button 
              variant={activeAction === "withdraw" ? "default" : "outline"}
              onClick={() => handleActionButtonClick("withdraw")}
              className={activeAction === "withdraw" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {activeAction === "withdraw" ? "Cancel Withdraw" : "Withdraw"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                {activeAction && <TableHead className="text-center">Amount</TableHead>}
                {activeAction && <TableHead className="text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: Account) => (
                <TableRow 
                  key={account.id}
                  className={selectedAccount === account.id ? "bg-muted/50" : ""}
                >
                  <TableCell>{account.email}</TableCell>
                  <TableCell className="text-right">₹{account.totalBalance.toFixed(2)}</TableCell>
                  {activeAction && (
                    <>
                      <TableCell>
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amounts[account.id] || ""}
                            onChange={(e) => {
                              setAmounts(prev => ({
                                ...prev,
                                [account.id]: parseFloat(e.target.value) || 0
                              }));
                              setSelectedAccount(account.id);
                            }}
                            placeholder="Enter amount"
                            className="w-40 text-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button 
                            size="sm"
                            onClick={() => handleAction(account.id)}
                            className={
                              activeAction === "deposit" 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {activeAction === "deposit" ? "Deposit" : "Withdraw"}
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
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