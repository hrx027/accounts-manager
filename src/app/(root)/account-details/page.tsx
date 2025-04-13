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

type Account = {
  id: string;
  email: string;
  pno: string;
  adhaarid: string;
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
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Account Details</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Enter details to add a new account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={newAccount.email}
                  onChange={handleInputChange}
                  placeholder="account@example.com" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pno">Phone Number</Label>
                <Input 
                  id="pno" 
                  name="pno" 
                  value={newAccount.pno}
                  onChange={handleInputChange}
                  placeholder="e.g. 9999999999" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adhaarid">Adhaar ID</Label>
                <Input 
                  id="adhaarid" 
                  name="adhaarid" 
                  value={newAccount.adhaarid}
                  onChange={handleInputChange}
                  placeholder="Adhaar ID" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalBalance">Initial Balance (₹)</Label>
                <Input 
                  id="totalBalance" 
                  name="totalBalance"
                  value={newAccount.totalBalance}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  required
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Save Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Accounts Found</CardTitle>
            <CardDescription>You don't have any accounts yet. Add an account to get started.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden overflow-x-auto">
          <Table>

            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="hidden sm:table-cell">Adhaar ID</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[100px] sm:w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: Account) => (
                <TableRow key={account.id} className="hover:bg-muted/20">
                  {editingRow === account.id ? (
                    <>
                      <TableCell>
                        <Input
                          name="email"
                          value={editFormData?.email || ''}
                          onChange={handleEditInputChange}
                          className="max-w-[150px] sm:max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          name="pno"
                          value={editFormData?.pno || ''}
                          onChange={handleEditInputChange}
                          className="max-w-[120px] sm:max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Input
                          name="adhaarid"
                          value={editFormData?.adhaarid || ''}
                          onChange={handleEditInputChange}
                          className="max-w-[120px] sm:max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          name="totalBalance"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editFormData?.totalBalance || 0}
                          onChange={handleEditInputChange}
                          className="max-w-[80px] sm:max-w-[100px] ml-auto text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSaveEdit(account.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="max-w-[120px] truncate">{account.email}</TableCell>
                      <TableCell>{account.pno}</TableCell>
                      <TableCell className="hidden sm:table-cell">{account.adhaarid}</TableCell>
                      <TableCell className="text-right">₹{account.totalBalance.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditClick(account)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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