"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Save, Trash2, X } from "lucide-react";
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

function AccountDetailsPage() {
  const { user } = useUser();
  const clerkId = user?.id || "";
  const accounts = useQuery(api.users.getUserAccounts, { clerkId }) || [];
  const addAccount = useMutation(api.users.addUserAccount);
  const updateAccount = useMutation(api.users.updateUserAccount);
  const deleteAccount = useMutation(api.users.deleteUserAccount);
  
  const [newAccount, setNewAccount] = useState({
    email: "",
    pno: "",
    adhaarid: "",
    username: "",
    deviceLocation: "",
    totalBalance: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: name === "totalBalance" ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editFormData) return;
    
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "totalBalance" ? parseFloat(value) || 0 : value
    });
  };

  const handleEditClick = (account: Account) => {
    setEditingRow(account.id);
    setEditFormData(account);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditFormData(null);
  };

  const handleDeleteClick = (accountId: string) => {
    setAccountToDelete(accountId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete || !clerkId) return;
    
    try {
      toast.promise(
        deleteAccount({
          clerkId,
          accountId: accountToDelete
        }),
        {
          loading: 'Deleting account...',
          success: () => {
            setIsDeleteDialogOpen(false);
            setAccountToDelete(null);
            return 'Account deleted successfully!';
          },
          error: (error) => {
            console.error("Failed to delete account:", error);
            return `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      toast.error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editFormData || !clerkId) return;
    
    try {
      toast.promise(
        updateAccount({
          clerkId,
          accountId: id,
          email: editFormData.email,
          pno: editFormData.pno,
          adhaarid: editFormData.adhaarid,
          username: editFormData.username,
          deviceLocation: editFormData.deviceLocation,
          totalBalance: editFormData.totalBalance
        }),
        {
          loading: 'Updating account...',
          success: () => {
            setEditingRow(null);
            setEditFormData(null);
            return 'Account updated successfully!';
          },
          error: (error) => {
            console.error("Failed to update account:", error);
            return `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to update account:", error);
      toast.error(`Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clerkId) return;
    
    try {
      toast.promise(
        addAccount({
          clerkId,
          email: newAccount.email,
          pno: newAccount.pno,
          adhaarid: newAccount.adhaarid,
          username: newAccount.username,
          deviceLocation: newAccount.deviceLocation,
          totalBalance: newAccount.totalBalance
        }),
        {
          loading: 'Creating new account...',
          success: (data) => {
            // Reset form and close dialog
            setNewAccount({
              email: "",
              pno: "",
              adhaarid: "",
              username: "",
              deviceLocation: "",
              totalBalance: 0
            });
            setIsDialogOpen(false);
            return `Account created successfully!`;
          },
          error: (error) => {
            console.error("Failed to add account:", error);
            return `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      );
    } catch (error: unknown) {
      console.error("Failed to add account:", error);
      toast.error(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 bg-white dark:bg-[#0F212E] text-black dark:text-white">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Account Details</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600 text-white cursor-pointer">
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600 text-black dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Add New Account</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-300">
                Enter details to add a new account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={newAccount.email}
                  onChange={handleInputChange}
                  placeholder="account@example.com" 
                  required
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pno" className="text-gray-700 dark:text-gray-200">Phone Number</Label>
                <Input 
                  id="pno" 
                  name="pno" 
                  value={newAccount.pno}
                  onChange={handleInputChange}
                  placeholder="e.g. 9999999999" 
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adhaarid" className="text-gray-700 dark:text-gray-200">Adhaar ID</Label>
                <Input 
                  id="adhaarid" 
                  name="adhaarid" 
                  value={newAccount.adhaarid}
                  onChange={handleInputChange}
                  placeholder="Adhaar ID" 
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-200">Username</Label>
                <Input 
                  id="username" 
                  name="username" 
                  value={newAccount.username || ''}
                  onChange={handleInputChange}
                  placeholder="Username" 
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceLocation" className="text-gray-700 dark:text-gray-200">Device/Location</Label>
                <Input 
                  id="deviceLocation" 
                  name="deviceLocation" 
                  value={newAccount.deviceLocation || ''}
                  onChange={handleInputChange}
                  placeholder="Device Location" 
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalBalance" className="text-gray-700 dark:text-gray-200">Initial Balance (₹)</Label>
                <Input 
                  id="totalBalance" 
                  name="totalBalance"
                  value={newAccount.totalBalance}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  required
                  className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600 text-white cursor-pointer">Save Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1A2C3A]">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Your Accounts</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-300">
            Manage your accounts and their balances.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white dark:bg-[#1A2C3A]">
                <TableRow className="border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="text-left text-gray-700 dark:text-gray-200 pl-4">Email</TableHead>
                  <TableHead className="text-left text-gray-700 dark:text-gray-200">Phone</TableHead>
                  <TableHead className="text-left text-gray-700 dark:text-gray-200 hidden md:table-cell">Aadhar ID</TableHead>
                  <TableHead className="text-left text-gray-700 dark:text-gray-200 hidden md:table-cell">Username</TableHead>
                  <TableHead className="text-left text-gray-700 dark:text-gray-200 hidden lg:table-cell">Device Location</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">Balance</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200 pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {accounts.map((account: Account) => (
                  <TableRow key={account.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#223541]">
                    {editingRow === account.id && editFormData ? (
                      // Editing row
                      <>
                        <TableCell className="pl-4">
                          <Input 
                            name="email" 
                            value={editFormData.email} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[160px] bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            name="pno" 
                            value={editFormData.pno || ""} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[120px] bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Input 
                            name="adhaarid" 
                            value={editFormData.adhaarid || ""} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[120px] bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Input 
                            name="username" 
                            value={editFormData.username || ""} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[120px] bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Input 
                            name="deviceLocation" 
                            value={editFormData.deviceLocation || ""} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[120px] bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input 
                            name="totalBalance" 
                            type="number"
                            step="0.01" 
                            value={editFormData.totalBalance} 
                            onChange={handleEditInputChange}
                            className="w-full max-w-[120px] ml-auto bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleSaveEdit(account.id)}
                              className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-[#223541]"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={handleCancelEdit}
                              className="h-8 w-8 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[#223541]"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      // Display row
                      <>
                        <TableCell className="max-w-[160px] truncate text-black dark:text-white pl-4">{account.email}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-black dark:text-white">{account.pno || '-'}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-black dark:text-white hidden md:table-cell">{account.adhaarid || '-'}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-black dark:text-white hidden md:table-cell">{account.username || '-'}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-black dark:text-white hidden lg:table-cell">{account.deviceLocation || '-'}</TableCell>
                        <TableCell className="text-right text-black dark:text-white">
                          <MoneyValue value={account.totalBalance} />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEditClick(account)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-[#223541]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteClick(account.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-[#223541]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-300">
                      No accounts found. Add your first account to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg bg-white dark:bg-[#1A2C3A] border-gray-200 dark:border-gray-600 text-black dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-300">
              This action cannot be undone. This will permanently delete the account
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setAccountToDelete(null)} className="bg-white dark:bg-[#223541] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A3F50]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AccountDetailsPage;