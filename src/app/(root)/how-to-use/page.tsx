"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Trophy, 
  DollarSign, 
  User, 
  ClipboardList, 
  History, 
  BarChart4,
  ArrowRight,
  Plus,
  Edit,
  Trash,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Award
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function HowToUsePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-3">How to Use Stake Manager</h1>
        <p className="text-muted-foreground">
          Welcome to Stake Manager! This guide will help you understand how to use all the features of the application.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-2 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" /> <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="place-bet" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> <span className="hidden sm:inline">Place Bet</span>
          </TabsTrigger>
          <TabsTrigger value="current-bets" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">Current Bets</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview of Stake Manager</CardTitle>
              <CardDescription>
                Learn about the app's core functionality and navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">What is Stake Manager?</h3>
                <p>
                  Stake Manager is a comprehensive application designed to help you manage betting accounts, track bets, and monitor performance. Whether you're managing multiple accounts or just keeping track of your betting activities, Stake Manager provides all the tools you need.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Core Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dashboard:</strong> View your total balance and profit/loss at a glance</li>
                  <li><strong>Account Management:</strong> Add, edit, and delete betting accounts</li>
                  <li><strong>Place Bets:</strong> Create bets on matches with custom odds</li>
                  <li><strong>Current Bets:</strong> Monitor active bets and settle them when matches end</li>
                  <li><strong>Bet History:</strong> Track all your past betting activity</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Navigation</h3>
                <p>
                  The sidebar menu (or top menu on mobile devices) allows you to navigate between different sections of the app:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Trophy className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-sm text-muted-foreground">View financial summary and quick actions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <DollarSign className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Place Bet</p>
                      <p className="text-sm text-muted-foreground">Create new bets on matches</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <ClipboardList className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Current Bets</p>
                      <p className="text-sm text-muted-foreground">View and settle active bets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <User className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Account Details</p>
                      <p className="text-sm text-muted-foreground">Manage your betting accounts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <History className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Bet History</p>
                      <p className="text-sm text-muted-foreground">View all past betting activity</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Managing Accounts</CardTitle>
              <CardDescription>
                Learn how to create and manage betting accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Adding a New Account</h3>
                <p>
                  To add a new betting account:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to <strong>Account Details</strong> in the sidebar</li>
                  <li>Click the <strong>Add Account</strong> button in the top right</li>
                  <li>
                    Fill in the required information:
                    <ul className="list-disc pl-6 mt-1">
                      <li><strong>Email:</strong> The account email address</li>
                      <li><strong>Phone Number:</strong> The associated phone number</li>
                      <li><strong>Adhaar ID:</strong> The identification number</li>
                      <li><strong>Initial Balance:</strong> Starting balance in rupees</li>
                    </ul>
                  </li>
                  <li>Click <strong>Save Account</strong> to create the account</li>
                </ol>

                <Alert className="mt-4">
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    You must add at least one account before you can place bets. Each account represents a separate betting entity.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Editing an Account</h3>
                <p>
                  To edit an existing account:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Find the account you want to edit in the accounts table</li>
                  <li>Click the <Edit className="inline h-4 w-4" /> (Edit) icon in the Actions column</li>
                  <li>Modify any of the account details</li>
                  <li>Click the <CheckCircle2 className="inline h-4 w-4" /> (Save) icon to save your changes</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Deleting an Account</h3>
                <p>
                  To delete an account:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Find the account you want to delete in the accounts table</li>
                  <li>Click the <Trash className="inline h-4 w-4 text-red-500" /> (Delete) icon in the Actions column</li>
                  <li>Confirm the deletion in the confirmation dialog</li>
                </ol>
                <Alert className="mt-4">
                  <AlertDescription className="text-destructive">
                    Warning: Deleting an account will permanently remove all its data, including associated bets. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Place Bet Tab */}
        <TabsContent value="place-bet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Placing Bets</CardTitle>
              <CardDescription>
                Learn how to create new bets on matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Creating a New Bet</h3>
                <p>
                  To place a new bet:
                </p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Navigate to <strong>Place Bet</strong> in the sidebar</li>
                  <li>
                    <p><strong>Step 1: Enter Match Details</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Team 1 Name:</strong> Enter the name of the first team</li>
                      <li><strong>Team 1 Odds:</strong> Set the odds for the first team</li>
                      <li><strong>Team 2 Name:</strong> Enter the name of the second team</li>
                      <li><strong>Team 2 Odds:</strong> Set the odds for the second team</li>
                      <li><strong>Divided By:</strong> The total pot amount to be divided</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-1">
                      The system will automatically calculate how much will be deducted from each account based on the odds and divided amount.
                    </p>
                  </li>
                  <li>Click <strong>Continue to Account Selection</strong></li>
                  <li>
                    <p><strong>Step 2: Select Accounts for Betting</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>For each account, select either Team 1 or Team 2 by checking the appropriate box</li>
                      <li>You can select multiple accounts, assigning each to either team</li>
                    </ul>
                  </li>
                  <li>Review your selections and click <strong>Place Bet</strong></li>
                </ol>

                <Alert className="mt-4">
                  <AlertTitle>Understanding Odds</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">When setting odds, remember:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Higher odds mean lower risk and smaller potential payout</li>
                      <li>Lower odds mean higher risk but larger potential payout</li>
                      <li>The amount deducted from an account = Divided Amount ÷ Team Odds</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Example Calculation</h3>
                <p>
                  Let's say you set up a bet with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Team 1 (India) with odds of 2.0</li>
                  <li>Team 2 (Australia) with odds of 4.0</li>
                  <li>Divided By amount of ₹1000</li>
                </ul>
                <p className="mt-2">This means:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Accounts betting on India will have ₹500 (1000 ÷ 2.0) deducted</li>
                  <li>Accounts betting on Australia will have ₹250 (1000 ÷ 4.0) deducted</li>
                  <li>If India wins, accounts that bet on India will get their deduction back plus profits</li>
                  <li>If Australia wins, accounts that bet on Australia will get their deduction back plus profits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Bets Tab */}
        <TabsContent value="current-bets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Managing Current Bets</CardTitle>
              <CardDescription>
                Learn how to view and settle active bets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Viewing Current Bets</h3>
                <p>
                  To view all active bets:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to <strong>Current Bets</strong> in the sidebar</li>
                  <li>You'll see a list of all active matches with pending bets</li>
                  <li>Click on a match row or the <ChevronDown className="inline h-4 w-4" /> button to expand and view all bets placed on that match</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  The expanded view shows details for each bet, including which team was selected for each account, the bet amount, and odds.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Settling a Bet</h3>
                <p>
                  After a match is completed, you need to settle the bet:
                </p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Find the match you want to settle</li>
                  <li>Click the <strong><Award className="inline h-4 w-4" /> Settle Bet</strong> button</li>
                  <li>
                    In the Settle Bet dialog:
                    <ul className="list-disc pl-6 mt-1 space-y-2">
                      <li>
                        <strong>Select the winning team</strong> - Choose which team won the match
                      </li>
                      <li>
                        <strong>Additional Options</strong> - You can check "Losing team hit six" if applicable
                      </li>
                      <li>
                        <strong>Cashout Options</strong> - For accounts that bet on the losing team, you can optionally specify a cashout amount
                      </li>
                    </ul>
                  </li>
                  <li>Click <strong>Settle Bet</strong> to complete the process</li>
                </ol>

                <Alert className="mt-4">
                  <AlertTitle>What Happens When a Bet is Settled?</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Accounts that bet on the winning team receive their original bet amount back plus profits</li>
                      <li>Accounts that bet on the losing team lose their bet amount (unless a cashout was specified)</li>
                      <li>The bet is moved from Current Bets to Bet History</li>
                      <li>Account balances are updated automatically</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Understanding Cashouts</h3>
                <p>
                  Cashouts allow you to return a portion of the bet amount to accounts that bet on the losing team:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>When settling a bet, check the box next to any losing account you want to cashout</li>
                  <li>Enter the amount to cashout for each selected account</li>
                  <li>When the bet is settled, these accounts will receive the specified cashout amount</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  Cashouts are useful in certain scenarios where you want to give partial returns to losing bets due to special circumstances.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bet History</CardTitle>
              <CardDescription>
                Learn how to track and manage your betting history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Viewing Bet History</h3>
                <p>
                  The Bet History section shows all your settled bets:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to <strong>Bet History</strong> in the sidebar</li>
                  <li>View a comprehensive table of all your past bets</li>
                  <li>Each row includes match details, account, bet amount, odds, result, payout, profit/loss, and timestamp</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  The history page helps you analyze your betting patterns and performance over time.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Understanding the History Table</h3>
                <p>
                  The history table contains the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Match:</strong> The teams that competed</li>
                  <li><strong>Account:</strong> Which account placed the bet</li>
                  <li><strong>Bet Amount:</strong> How much was bet</li>
                  <li><strong>Odds:</strong> The odds for the selected team</li>
                  <li><strong>Result:</strong> Whether the bet won or lost</li>
                  <li><strong>Payout:</strong> The total amount paid out for winning bets</li>
                  <li><strong>Profit/Loss:</strong> The net profit or loss from the bet</li>
                  <li><strong>Time:</strong> When the bet was settled</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Clearing Bet History</h3>
                <p>
                  If you want to clear your bet history:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Click the <strong>Clear History</strong> button at the top of the Bet History page</li>
                  <li>Confirm the action in the confirmation dialog</li>
                </ol>
                <Alert className="mt-4">
                  <AlertDescription className="text-destructive">
                    Warning: Clearing your bet history will permanently delete all records of past bets. This action cannot be undone. Note that this doesn't affect account balances or current bets.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Using the Dashboard</CardTitle>
              <CardDescription>
                Learn how to use the dashboard to monitor performance and manage finances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Dashboard Overview</h3>
                <p>
                  The Dashboard provides a quick summary of your financial position:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Total Balance:</strong> The sum of all account balances</li>
                  <li><strong>Net Profit/Loss:</strong> Your overall betting performance</li>
                  <li><strong>Accounts Table:</strong> A quick view of all accounts with action buttons</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Managing Account Finances</h3>
                <p>
                  You can directly deposit or withdraw funds from accounts on the dashboard:
                </p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Making a Deposit:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Locate the account in the accounts table</li>
                      <li>Click the <strong>Deposit</strong> button</li>
                      <li>Enter the amount to deposit</li>
                      <li>Click <strong>Deposit</strong> to confirm</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Making a Withdrawal:</strong>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Locate the account in the accounts table</li>
                      <li>Click the <strong>Withdraw</strong> button</li>
                      <li>Enter the amount to withdraw</li>
                      <li>Click <strong>Withdraw</strong> to confirm</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Resetting Profit/Loss</h3>
                <p>
                  If you want to start fresh with profit/loss tracking:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Click the <strong>Reset</strong> button next to the Net Profit/Loss card</li>
                  <li>The profit/loss counter will be reset to zero, but account balances remain unchanged</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  This is useful for starting a new tracking period, such as a new month or season.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Start with Account Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Always set up your accounts first before placing any bets. You need at least one account to start betting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Understanding Odds</h3>
                  <p className="text-sm text-muted-foreground">
                    Lower odds values mean higher potential returns but higher risk. Ensure you set odds correctly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Mobile Friendly</h3>
                  <p className="text-sm text-muted-foreground">
                    Stake Manager works on mobile devices too. Access the menu by tapping the hamburger icon in the top right.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Regular Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your dashboard regularly to track your overall performance and make informed decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HowToUsePage;